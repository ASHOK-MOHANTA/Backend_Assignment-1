const mongoose = require("mongoose");

const connectDB = async()=>{
    try{
        await mongoose.connect("mongodb://127.0.0.1:27017/user_Profile");
        console.log("Database connected");
    }catch(err){
        console.log("DB not connected");
        console.error(err);
    }

}

module.exports = connectDB;