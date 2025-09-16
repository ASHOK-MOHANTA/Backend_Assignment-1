const mongoose = require("mongoose");
require("dotenv").config();

const connectToDB = async ()=>{
    try {
       await mongoose.connect(process.env.MONGO_URI);
       console.log("DB Connected")
    } catch (error) {
        console.error(error);
        console.log("Error in connecting DB");
    }
};

module.exports = connectToDB;