<<<<<<< HEAD
const express = require("express");
const fileInfo = require("./fileinfo")
const urlParser = require("./urlparser")
const app = express();

const port = 3000;

// Define a test route
app.get("/test", (req, res) => {
  res.send("Test route is working!");
});

// Start server
app.listen(port, () => {
  console.log(`App is running at http://localhost:${port}`);
});

app.get("/fileinfo",(req,res)=>{
  const filepath = req.query.filepath;
  if(!filepath){
    return res.status(400).json({error:"Missing file path query parameter"});
  }
  const result = fileInfo(filepath);
  res.json(result);
});

app.get("/parseurl",(req,res)=>{
  const inputUrl = req.query.url;
  if(!inputUrl){
    res.status(400).json({error: "Missing URL query parameter"});
  }
  const result =  urlParser(inputUrl);
  res.json(result)
})
=======
const express = require("express");

const app =express();
const port = 3000;

app.get("/home",(req,res)=>{
    res.send("This is home page")
});

app.get("/contact",(req,res)=>{
    res.send("Contact Us at contact@gmail.com");
})

app.listen(port,()=>{
    console.log(`App is running at port ${port}`)
})
>>>>>>> 573dca29579af3700becd11b6ddc3cd65c185d4e
