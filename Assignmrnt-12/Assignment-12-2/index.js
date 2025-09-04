import express from "express";
import Redis from "ioredis";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Joi from "joi";
import cron from "node-cron";

// =======================
// Config & Setup
// =======================
const app = express();
const redis = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379");
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

// middlewares
app.use(express.json());

// =======================
// In-Memory "DB"
// =======================
// Users: [{ id, username, passwordHash }]
const users = [];
let nextUserId = 1;

// Books per user: { [userId]: [{ id, title, author, year }] }
const booksDB = new Map();
// global incremental book id (per user we still guarantee uniqueness)
let nextBookId = 1;

// =======================
// Redis Keys (per user)
// =======================
// Cache key for GET /books
const booksCacheKey = (userId) => `user:${userId}:books`;
// Bulk insertion queue (Redis List)
const bulkBooksListKey = (userId) => `user:${userId}:bulkBooks`;
// Set of users with pending bulk payloads
const bulkUsersSetKey = () => `bulk:users:pending`;

// =======================
// Validation Schemas
// =======================
const signupSchema = Joi.object({
  username: Joi.string().min(3).max(40).required(),
  password: Joi.string().min(6).max(100).required(),
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const bookSchema = Joi.object({
  title: Joi.string().min(1).required(),
  author: Joi.string().min(1).required(),
  year: Joi.number().integer().min(0).max(3000).required(),
});

const bulkBooksSchema = Joi.array().items(bookSchema).min(1).required();

// =======================
// Helpers
// =======================
function getUserBooks(userId) {
  if (!booksDB.has(userId)) booksDB.set(userId, []);
  return booksDB.get(userId);
}

function invalidateBooksCache(userId) {
  const key = booksCacheKey(userId);
  return redis.del(key).then(() => {
    console.log(`🗑  Cache invalidated for user ${userId} → ${key}`);
  });
}

function issueToken(user) {
  return jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: "1h",
  });
}

// Auth middleware
function auth(req, res, next) {
  const authz = req.headers.authorization || "";
  const token = authz.startsWith("Bearer ") ? authz.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing Bearer token" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, username: payload.username };
    return next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// =======================
// Routes: Auth
// =======================
app.post("/signup", async (req, res) => {
  try {
    const { value, error } = signupSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const exists = users.find((u) => u.username === value.username);
    if (exists) return res.status(409).json({ error: "Username taken" });

    const passwordHash = await bcrypt.hash(value.password, 10);
    const user = { id: nextUserId++, username: value.username, passwordHash };
    users.push(user);
    booksDB.set(user.id, []); // initialize empty books array for user

    const token = issueToken(user);
    res.status(201).json({ message: "Signup successful", token });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { value, error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const user = users.find((u) => u.username === value.username);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(value.password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = issueToken(user);
    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get("/books", auth, async (req, res) => {
  const userId = req.user.id;
  const key = booksCacheKey(userId);

  try {
    const cached = await redis.get(key);
    if (cached) {
      console.log(` Cache hit for user ${userId}`);
      return res.json(JSON.parse(cached));
    }

    console.log(` Cache miss for user ${userId} → Fetching from DB`);
    const data = getUserBooks(userId);

    // cache with TTL 60 seconds
    await redis.set(key, JSON.stringify(data), "EX", 60);

    res.json(data);
  } catch (err) {
    console.error("GET /books error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /books – add & invalidate cache
app.post("/books", auth, async (req, res) => {
  const userId = req.user.id;
  try {
    const { value, error } = bookSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const books = getUserBooks(userId);
    const newBook = { id: nextBookId++, ...value };
    books.push(newBook);

    await invalidateBooksCache(userId);
    res.status(201).json(newBook);
  } catch (err) {
    console.error("POST /books error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT /books/:id – update & invalidate cache
app.put("/books/:id", auth, async (req, res) => {
  const userId = req.user.id;
  const bookId = Number(req.params.id);
  try {
    // allow partial update but validate fields if present
    const partialSchema = Joi.object({
      title: Joi.string().min(1),
      author: Joi.string().min(1),
      year: Joi.number().integer().min(0).max(3000),
    }).min(1);

    const { value, error } = partialSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const books = getUserBooks(userId);
    const idx = books.findIndex((b) => b.id === bookId);
    if (idx === -1) return res.status(404).json({ error: "Book not found" });

    books[idx] = { ...books[idx], ...value };

    await invalidateBooksCache(userId);
    res.json(books[idx]);
  } catch (err) {
    console.error("PUT /books/:id error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE /books/:id – delete & invalidate cache
app.delete("/books/:id", auth, async (req, res) => {
  const userId = req.user.id;
  const bookId = Number(req.params.id);
  try {
    const books = getUserBooks(userId);
    const idx = books.findIndex((b) => b.id === bookId);
    if (idx === -1) return res.status(404).json({ error: "Book not found" });

    const [deleted] = books.splice(idx, 1);

    await invalidateBooksCache(userId);
    res.json({ deleted });
  } catch (err) {
    console.error("DELETE /books/:id error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.post("/books/bulk", auth, async (req, res) => {
  const userId = req.user.id;
  try {
    const { value, error } = bulkBooksSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const listKey = bulkBooksListKey(userId);

    // Push each book as JSON string to user's list
    const pipeline = redis.pipeline();
    value.forEach((book) => pipeline.rpush(listKey, JSON.stringify(book)));
    // Track this user as having pending work
    pipeline.sadd(bulkUsersSetKey(), String(userId));
    await pipeline.exec();

    console.log(` Queued ${value.length} book(s) for user ${userId} in ${listKey}`);
    res.json({ message: "Books will be added later." });
  } catch (err) {
    console.error("POST /books/bulk error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


cron.schedule("*/2 * * * *", async () => {
  const usersPendingKey = bulkUsersSetKey();
  try {
    const userIds = await redis.smembers(usersPendingKey);
    if (!userIds.length) {
      console.log("  Cron: No pending bulk jobs.");
      return;
    }

    console.log(`  Cron: Processing bulk jobs for users: ${userIds.join(", ")}`);

    for (const userIdStr of userIds) {
      const userId = Number(userIdStr);
      const listKey = bulkBooksListKey(userId);

    
      while (true) {
        const item = await redis.lpop(listKey);
        if (!item) {
          
          await redis.srem(usersPendingKey, userIdStr);
          console.log(` Cron: Completed bulk queue for user ${userId}.`);
          break;
        }

        
        let book;
        try {
          book = JSON.parse(item);
        } catch {
          console.warn(`  Cron: Invalid JSON for user ${userId}; skipping item.`);
          continue;
        }

        try {
          
          const { value, error } = bookSchema.validate(book);
          if (error) {
            console.warn(` Cron: Validation failed for user ${userId}: ${error.message}`);
            continue;
          }

          const books = getUserBooks(userId);
          const newBook = { id: nextBookId++, ...value };
          books.push(newBook);
          console.log(` Cron: Inserted book (id=${newBook.id}) for user ${userId}`);

       
          await invalidateBooksCache(userId);
        } catch (err) {
     
          await redis.lpush(listKey, item);
          console.error(` Cron: Error processing user ${userId}, will retry next run:`, err);
          break; 
        }
      }
    }
  } catch (err) {
    console.error(" Cron error:", err);
  }
});


app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});
