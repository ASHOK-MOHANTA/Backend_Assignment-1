const express = require("express");
const orderModel = require("../models/order_model");

const orderRouter = express.Router();


orderRouter.post("/add-order",async(req,res)=>{
    //order amount, Name, Delivery Status, Mode of Payment,Order by Coming from request.body

    try {
        let order = await orderModel.create(req.body);
        res.status(201).json({msg:"Order Created",orderDetails:order});
    } catch (error) {
        res.status(500).json({message:"Some thing Went Wrong Please Try again.."})
    }
})

// get order by user id

orderRouter.get("/:userId",async(req,res)=>{
    const {userId} = req.params;
    try {
        let orders = await orderModel.find({orderby:userId}).populate("orderby");
        res.status(200).json({msg:"Order List",orders})

    } catch (error) {
        res.status(500).json({message:"Some thing Went Wrong Please Try again.."})
    }
});

// Update Order

orderRouter.patch("/update-order/:orderId",async(req,res)=>{
    // order is comming from params
    // updated data is comming from req.body
    // I will update the order with out touching user , because order is independet entity

    try {
        const {orderId} = req.params;
        let order = await  orderModel.findByIdAndUpdate(orderId,req.body,{new:true});
        res.status(201).json({message:"Order Updated",details:order})
    } catch (error) {
        res.status(500).json({message:"Some thing Went Wrong Please Try again.."})
    }
})

// Delete the order

orderRouter.delete("/delete-order/:orderId",async(req,res)=>{
    // order is comming from params
    // I will delete the order without touching user , because order is independent entity from user

    try {
        const {orderId} = req.params;
        let order = await  orderModel.findByIdAndDelete(orderId);
        res.status(200).json({message:"Order Deleted"})
    } catch (error) {
        res.status(500).json({message:"Some thing Went Wrong Please Try again.."})
    }
})

// time 1:14


module.exports = orderRouter;