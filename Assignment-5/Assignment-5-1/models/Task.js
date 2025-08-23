const mongoose = require("mongoose");

const  taskSchema = new mongoose.Schema({
    title: {type:String,required:true},
    description: String,
    status:{type:String,enum: ["pending","In Progress","Completed"], default: "pending"},
    dueDate: {type:Date},
},{timestamps:true});


const Task = mongoose.model("Task",taskSchema);

module.exports = Task