const mongoose = require("mongoose");

const profileScheme = new mongoose.Schema({
    bio:{
        type:String,
    },
    SocialMediaLink:{
        type:[String],
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required,
        unique: true // one-to-one
    }
});


module.exports = mongoose.model("Profile",profileScheme)