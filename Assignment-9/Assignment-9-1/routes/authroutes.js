const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { use } = require("react");


const router = express.Router();

router.post("/signup", async(req,res)=>{
    try{
        const {name,email,password} = req.body;
        const existingUser = await User.findOne({email});
        if(existingUser) return res.status(400).json({meaasge: "User Already exists"});

        const hashedPassword = await bcrypt.hash(password,10);
        const newUser = new User({name,email,password: hashedPassword});
        await newUser.save();

        res.status(201).json({message:"User registred Successfully!!"});
    }catch(err){
        res.status(500).json({message:"Error in signup", error: err.meaasge});
    };
});


// login Route

router.post("/login", async(req,res)=>{
    try {
        const {email,password} = req.body;

        const user = User.findOne({email});
        if(!user) return res.status(400).json({message:"Invalid credentials"});

        // generate jwt

        const token = jwt.sign(
            {id: user._id, email: user.email},
            process.env.JWT_SECRET,
            {expiresIn:"1h"}
        );

        res.json({message:"Login SuccessFull",token})
    } catch (error) {
        res.status(500).json({message:"Error logining in",error: error.meaasge});
    }
})

module.exports = router;