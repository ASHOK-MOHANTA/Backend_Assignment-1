const express = require("express");
const userModel = require("../models/user_model");
const orderModel = require("../models/order_model");

const UserRouter = express.Router();

UserRouter.post("/add-user", async (req, res) => {
  ///name,email,age,gender is comming from req.body which is an object
  // that should be added to db through user model

  try {
    let user = await userModel.create(req.body);
    res.status(200).json({ message: "User Created", user });
  } catch (error) {
    // 500 internal server error
    console.log(error)
    res
      .status(500)
      .json({ message: "Something Went wrong please try again later..." });
  }
});

UserRouter.patch("/add-address/:userId", async (req, res) => {
  // address is coming from req.body
  // I need to userid as ref , userId should be passed as path params
  // find the user by id
  // push the new address into address array present in user document;
  // save the user
  const { userId } = req.params;
  try {
    let user = await userModel.findById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found..." });
    } else {
      // req.body is a object
      user.address.push(req.body);
      // save the user new address
      console.log(user.address);
      await user.save();
      res
        .status(201)
        .json({ message: `Address added to the user ${user.name}` });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something Went wrong please try again later..." });
  }
}); 


// Female User less then age 30

UserRouter.get("/analytics/flt30", async(req,res)=>{
  let users = await userModel.find({$and : [{gender:"female"},{age:{$lte:30}}]},{name:1,age:1,gender:1});
  res.status(201).json(users);
});

// Relationship means not linking schema 
// Relationship said to established completily, if data integrity
// If user is deleted delete all the order records first then delete user

UserRouter.delete("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // delete all orders associated with the user
    await orderModel.deleteMany({ orderby: userId });

    // delete the user itself
    await userModel.findByIdAndDelete(userId);

    res.status(200).json({ msg: "User and their associated data deleted" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later..." });
  }
});


module.exports = UserRouter;
