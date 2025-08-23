const mongoose = require("mongoose");

// create s schema...

const userSchema = new mongoose.Schema(
    {
        name:String,
        age:Number,
        email:String,
        isMarried:Boolean,
        location:String
    }
)

// create a model........

const UserModel = mongoose.model("user",userSchema);

module.exports = UserModel;