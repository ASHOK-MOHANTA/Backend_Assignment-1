const express = require("express");
const connectDB = require("./configs/mongodb");
const UserRouter = require("./routers/user_router");
const orderRouter = require("./routers/order_routes");
//step :1 Basic express setup
//step :2 Connecting mongoBb with NodeJS
//step :3 Creating Schema And Model
//step :3 Create routes/controller and test in postmain

const app = express();
app.use(express.json()); // body parser middle ware

connectDB();

app.get("/test",(req,res)=>{
    res.status(200).json({msg:"This is test route"});
});

// User Routes

app.use("/users",UserRouter)

// Order Routers

app.use("/orders",orderRouter);


//Handling undefined routes

app.use((req,res)=>{
    res.status(404).json({message:"This request is not found.."})
})

app.listen(3000,()=>{
    console.log("Server is running on 3000");
});