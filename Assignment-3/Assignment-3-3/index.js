const express = require("express");
const fs = require("fs");
const app = express();
const PORT = 3000;

app.use(express.json());

const DB_File = "./db.json";

// Read DB
const readDB = () => {
    const data = fs.readFileSync(DB_File, "utf-8");
    return JSON.parse(data);
};

// Write DB
const writeDB = (data) => {
    fs.writeFileSync(DB_File, JSON.stringify(data, null, 2), "utf-8");
};

// Add new dish
app.post("/dishes", (req, res) => {
    try {
        const { id, name, price, category } = req.body;
        if (!id || !name || !price || !category) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const db = readDB();
        db.dishes.push({ id, name, price, category });
        writeDB(db);

        res.status(201).json({ message: "Dish added successfully!!", dish: { id, name, price, category } });
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
});

// Get all dishes
app.get("/dishes", (req, res) => {
    try {
        const db = readDB();
        res.status(200).json(db.dishes);
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
});

// Get dish by id
app.get("/dishes/:id", (req, res) => {
    try {
        const db = readDB();
        const dish = db.dishes.find(d => d.id == req.params.id);

        if (!dish) {
            return res.status(404).json({ message: "Dish Not Found" });
        }
        res.status(200).json(dish);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Update dish by id
app.put("/dishes/:id", (req, res) => {
    try {
        const db = readDB();
        const dishIdx = db.dishes.findIndex(d => d.id == req.params.id);

        if (dishIdx === -1) {
            return res.status(404).json({ message: "Dish not found!!" });
        }

        db.dishes[dishIdx] = { ...db.dishes[dishIdx], ...req.body };
        writeDB(db);

        res.status(200).json({ message: "Dish Updated Successfully!!", dish: db.dishes[dishIdx] });
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error..." });
    }
});

// Delete dish by id
app.delete("/dishes/:id", (req, res) => {
    try {
        const db = readDB();
        const newDishes = db.dishes.filter(d => d.id != req.params.id);

        if (newDishes.length === db.dishes.length) {
            return res.status(404).json({ message: "Dish Not Found!!" });
        }

        db.dishes = newDishes;
        writeDB(db);

        res.status(200).json({ message: "Dish Deleted Successfully!!" });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// Search dish by name query
app.get("/dishes/get", (req, res) => {
    try {
        const { name } = req.query;
        if (!name) {
            return res.status(400).json({ message: "Dish query is required" });
        }

        const db = readDB();
        const result = db.dishes.filter(d => d.name.toLowerCase().includes(name.toLowerCase()));

        if (result.length === 0) {
            return res.status(404).json({ message: "No dish Found!!" });
        }

        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: "Server Error!!" });
    }
});

// Handle undefined routes
app.use((req, res) => {
    res.status(404).json({ message: "404 not found!!" });
});

app.listen(PORT, () => {
    console.log(`Server is running at ${PORT}`);
});
