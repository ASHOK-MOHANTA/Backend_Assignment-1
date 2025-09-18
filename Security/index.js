const express = require("express");
const connectToDB = require("./configs/mongo_Config");
const UserRouter = require("./routes/user_routes");
const todoRouter = require("./routes/todo_routes");
require("dotenv").config();
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;


app.get("/test",(req,res)=>{
    try {
        res.status(200).json({message:"This is test route"});

    } catch (error) {
        console.error(error);
        res.status(500).json({message:"Something Went wrong..."})
    }
});

// Users Routers

app.use("/users",UserRouter);

// Todo Routes

app.use("/todo",todoRouter)

app.listen(PORT,()=>{
    console.log("Sever is running at",PORT)
});
connectToDB();
