const mongoose = require("mongoose");

const connectToDB = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/mongooseTest");
        console.log("DB conntected")
    } catch (err) {
        console.log("not connected");
        console.error(err);
    }

}

module.exports = connectToDB;