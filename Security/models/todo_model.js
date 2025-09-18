const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
    title : {type:String,required:true},
    status:{type:Boolean,required:true},
    userId : {type:mongoose.Schema.Types.ObjectId,ref:"User"}
});

const todoModel = mongoose.model("todo",todoSchema);

module.exports = todoModel;