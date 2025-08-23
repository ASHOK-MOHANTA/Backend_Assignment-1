const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const Task = require("./models/Task");


const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

connectDB();

app.post("/tasks",async (req,res)=>{
    try{
        const newTask = new Task(req.body);
        await newTask.save();
        res.status(201).json(newTask);
    }catch(err){
        res.status(400).json({message: err.message});
    };
});


app.get("/tasks",async(req,res)=>{
    try{
        const {status,dueDate} = req.query;
        let filter = {};
        if(status) filter.status = status;
        if(dueDate) filter.dueDate = {$lte: new Date(dueDate)};

        const tasks = await Task.find(filter);
        res.json(tasks);
    }catch(err){
        res.status(500).json({message: err.message});
    }
});

// Update Task

app.put("/tasks/:id", async (req,res)=>{
    try{
        const UpdatedTask = await Task.findByIdAndUpdate(req.params.id, req.body,{new: true});
        res.json(UpdatedTask);
    }catch(err){
        res.status(400).json({message: err.message});
    }
});


// Delete task

app.delete("/tasks/:id",async (req,res) =>{
    try{
        await Task.findByIdAndDelete(req.params.id);
        res.json({message: "Task deleted Successfuly!!"});
    }catch(err){
        res.status(500).json({message: err.message});
    }
});


// server start

app.listen(PORT,()=>{
    console.log("Server is running at:",PORT)
})