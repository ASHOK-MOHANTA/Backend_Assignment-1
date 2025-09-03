require("dotenv").config();

const express = require("express");
const nodemailer = require("nodemailer");

const app = express();
const PORT = 3000;

let transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
});

app.get("/sendmail",async (req,res)=>{
    try {
        let info = await transporter.sendMail({
            from: '"NEM Student" <subendum25@gmail.com> ',
            to: ["subendum25@gmail.com","ashokm95567@gmail.com"],
            subject:"This is a test Mail",
            text: "This is a testing Mail sent by NEM student, no need to reply.",
        });
        console.log("Message sent: %s", info.messageId);
        res.send("Email Send Successfully!!");
    } catch (error) {
        console.log(error);
        res.status(500).send("Failed to Send Email");
    }
});


app.listen(PORT, ()=>{
    console.log("Server Is running at",PORT);
})