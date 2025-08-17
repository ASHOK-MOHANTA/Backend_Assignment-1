const express = require("express");
const logger = require("./eventLogger");
const delayMessage = require("./delay");

const app = express();
const PORT = 3000;

app.get("/test",(req,res)=>{
    res.send("The test routing is working!!");
})

app.get("/emit",(req,res)=>{
    const {message} = req.query;
    if(!message){
        return res.status(400).json({error:"Message query param required"});
    }
    logger.emit("log",message);

    res.json({
        status:"Event loaged",
        timestamp: new Date().toISOString()
    });
});

app.get("/delay", async (req, res) => {
  const { message, time } = req.query;
  const delayTime = parseInt(time);

  if (!message || isNaN(delayTime)) {
    return res.status(400).json({ error: "Message and valid time required" });
  }

  const result = await delayMessage(message, delayTime);

  // 🔹 Emit a log event after delay
  logger.emit("log", `Delay complete: "${result}" after ${delayTime}ms`);

  res.json({
    message: result,
    delay: `${delayTime}ms`,
  });
});

app.listen(PORT,()=>{
    console.log(`Server is running at port${PORT}`)
})