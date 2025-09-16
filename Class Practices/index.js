const express = require("express");
const connectToDB = require("./configs/mongos_config");
const LMSRouter = require("./routes/lms_routes");
require("dotenv").config();
const PORT = process.env.PORT || 3000
const app = express();
app.use(express.json()); // body perser middleware
connectToDB();


// This is test Route
app.get("/",(req,res)=>{
    res.status(200).json({message:"This is a test Route"});
});


// LMS Routes

app.use("/lms",LMSRouter);

// This is Undefined Routes
app.use((req,res)=>{
    res.status(404).json({message:"Undefined Routes"});
});



app.listen(PORT,()=>{
    console.log("Server Is Running at",PORT);
})
