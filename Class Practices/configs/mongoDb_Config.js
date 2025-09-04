const mongoose = require("mongoose");


const ConnectToDb = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected To DB");
        
    } catch (error) {
        console.log("Failed To Connected DB");
        
    }
}

module.exports = ConnectToDb;