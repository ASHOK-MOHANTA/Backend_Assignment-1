const express = require("express");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const UserRouter = express.Router();

// Signup Route
UserRouter.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Hash password
    bcrypt.hash(password, saltRounds, async (err, hash) => {
      if (err) {
        return res.status(500).json({ message: "Something Went Wrong!!" });
      }

      console.log("Raw Password:", password, "Hashed Password:", hash);

      // TODO: Save user to DB (MongoDB / MySQL / etc.)
      // Example:
      // await User.create({ username, email, password: hash });

      res.status(201).json({ message: "Signup Success" });
    });
  } catch (error) {
    res.status(500).json({ message: "Something Went Wrong!!" });
  }
});

module.exports = UserRouter;
