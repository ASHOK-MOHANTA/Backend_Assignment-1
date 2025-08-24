const express = require("express");
const User = require("../models/User");
const router = express.Router();

// POST /users - create a new user
router.post("/users", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ message: "User Created", user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /users/:userId/address - add new address
router.post("/users/:userId/address", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.addresses.push(req.body); // ✅ use addresses
    await user.save();

    res.status(201).json({ message: "Address added", user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /users/summary
router.get("/users/summary", async (req, res) => {
  try {
    const users = await User.find();
    const totalUsers = users.length;
    const totalAddresses = users.reduce((acc, user) => acc + user.addresses.length, 0);

    const userSummary = users.map((u) => ({
      name: u.name,
      addressCount: u.addresses.length, // ✅ count only
    }));

    res.json({ totalUsers, totalAddresses, users: userSummary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /users/:userId - get user details with addresses
router.get("/users/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /users/:userId/address/:addressId - delete specific address
router.delete("/users/:userId/address/:addressId", async (req, res) => {
  try {
    const { userId, addressId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.addresses.id(addressId).remove(); // ✅ use addresses
    await user.save();

    res.json({ message: "Address deleted", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
