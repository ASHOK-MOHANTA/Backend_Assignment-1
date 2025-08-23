const express = require("express");
const app = express();
const connectToDB = require("./config/mongodb.config");
const UserRouter = require("./routes/user.route");
app.use(express.json())

connectToDB();
const PORT = 3000

app.use("/user",UserRouter)

app.listen(PORT,()=>{
    console.log("Server is running at", PORT);
})

