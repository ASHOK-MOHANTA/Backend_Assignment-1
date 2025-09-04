// server.js
const express = require("express");
const Redis = require("ioredis");

const app = express();
const redis = new Redis(); 

app.use(express.json());


let itemsDB = [
  { id: 1, name: "Pen", price: 10 },
  { id: 2, name: "Book", price: 50 },
];

// Redis cache key
const CACHE_KEY = "items:all";


app.get("/items", async (req, res) => {
  try {
    const cached = await redis.get(CACHE_KEY);

    if (cached) {
      console.log("✅ Cache hit");
      return res.json(JSON.parse(cached));
    }

    console.log("❌ Cache miss → Fetching from DB");

    const data = itemsDB;

   
    await redis.set(CACHE_KEY, JSON.stringify(data), "EX", 60);

    res.json(data);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.post("/items", async (req, res) => {
  const { name, price } = req.body;

  const newItem = {
    id: itemsDB.length ? itemsDB[itemsDB.length - 1].id + 1 : 1,
    name,
    price,
  };
  itemsDB.push(newItem);

  // Invalidate cache
  await redis.del(CACHE_KEY);
  console.log("🗑 Cache invalidated after POST");

  res.status(201).json(newItem);
});


app.put("/items/:id", async (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;

  let item = itemsDB.find((it) => it.id === parseInt(id));
  if (!item) return res.status(404).json({ error: "Item not found" });

  item.name = name ?? item.name;
  item.price = price ?? item.price;

  await redis.del(CACHE_KEY);
  console.log("🗑 Cache invalidated after PUT");

  res.json(item);
});


app.delete("/items/:id", async (req, res) => {
  const { id } = req.params;

  const index = itemsDB.findIndex((it) => it.id === parseInt(id));
  if (index === -1) return res.status(404).json({ error: "Item not found" });

  const deleted = itemsDB.splice(index, 1);

  await redis.del(CACHE_KEY);
  console.log("🗑 Cache invalidated after DELETE");

  res.json({ deleted });
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
