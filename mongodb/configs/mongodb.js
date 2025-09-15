const mongoose = require("mongoose");

const connectDB = async ()=>{
    try {
         await mongoose.connect("mongodb://127.0.0.1:27017/mydatabase");
         console.log("DB Connected")
    } catch (error) {
        console.log(error);
        console.log("Error In Connecting DB");
    }
}

module.exports = connectDB;