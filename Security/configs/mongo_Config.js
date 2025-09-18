const mongoose = require("mongoose");

const connectToDB = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");
    } catch (error) {
        console.error(error);
        console.log("Failed To Connect")
    }
}

module.exports = connectToDB;