const express = require("express");
const UserModel = require("../model/usermodel");

const UserRouter = express.Router();


// get all user from user collection

UserRouter.get("/", async (req, res) => {

    try {
        let users = await UserModel.find({});

        res.status(200).json({ msg: "User list", users })
    }catch(err){
        console.log("Data not fatch");
        console.error(err);
        
    }
    
})


// add user into user collection

UserRouter.post("/add-user", async (req,res)=>{
    
})

module.exports = UserRouter;