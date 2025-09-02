const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    githubId :{type: String, required:true,unique:true},
    username: String,
    email:String,
    avatar: String,
    name: String,
    createdAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model("User", userSchema);