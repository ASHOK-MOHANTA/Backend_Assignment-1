const express = require("express");
const bcrypt = require("bcrypt");
const UserModel = require("../models/user_model");
const saltRounds = 10;
const myPlaintextPassword = "s0//P4$$w0rD";
const someOtherPlaintextPassword = "not_bacon";

const UserRouter = express.Router();

// Signup
//Client will provide username,email,password from req.body
//  so we have to strore hashed password so bcrypt helps the password to hashed;

UserRouter.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Hash the password with async/await
    const hash = await bcrypt.hash(password, saltRounds);

    // Save to DB
    await UserModel.create({ username, email, password: hash });

    res.status(201).json({ message: "Signup Success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something Went Wrong.." });
  }
});


module.exports = UserRouter;
