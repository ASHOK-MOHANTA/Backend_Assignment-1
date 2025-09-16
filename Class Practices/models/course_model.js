const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    title:String,
    description:String
});


const couseModel = mongoose.model("Course",courseSchema);

module.exports = couseModel;