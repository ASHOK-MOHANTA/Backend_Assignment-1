const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required,
        minlength:[3,"Name most at least 3 charecter long"]
    },
    email:{
        type:String,
        required,
        unique:true
    }
});

module.exports = mongoose.model("User",userSchema)