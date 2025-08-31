const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    email: {String, unique : true,required:true},
    password: {String, required: true}
});

module.exports = mongoose.model("User",userSchema);