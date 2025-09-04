const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 3000
const ConnectToDb = require("./configs/mongoDb_Config");
const UserRouter = require("./routes/user_Routes");
const TodoRouter = require("./routes/todo_Router");
app.use(express.json());


ConnectToDb();
app.get("/test",(req,res)=>{
    try {
        res.status(200).json({message:"This is test route"})
    } catch (error) {
        res.status(500).json({message:"Something Went Wrong"})
    }
})

/// User Router

app.use("/users",UserRouter)

/// Todo Router

app.use("/todos",TodoRouter)

// handling undefined routes

// app.use((req,res)=>{
//     try {
//         res.status(200).json({message:"This is test route"})
//     } catch (error) {
//         res.status(500).json({message:"Something Went Wrong"})
//     }
// })


app.listen(PORT,(req,res)=>{
    console.log("Server is running at",PORT);
})