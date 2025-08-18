const express = require("express");
const app = express();

const PORT = 3000;

app.get("/home",(req,res)=>{
    res.status(200).send("<h1>Well Come to Home Page.</h1>")
});

app.get("/aboutus",(req,res)=>{
    res.status(200).json({message:"Well Come to About us page"})
});

app.get("/contactus",(req,res)=>{
    res.status(200).json({
        email:"contact@gmail.com",
        phone:"+91 9556785557",
        address:"345,Karanjia,Odisha"
    });
});

app.get((req,res)=>{
    res.status(404).send("404 not Found");
});

app.listen(PORT,()=>{
    console.log("Backend is running at",PORT);
})