const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    name:String,
    email:String
});

const studentModel = mongoose.model("Student",studentSchema);

module.exports = studentModel