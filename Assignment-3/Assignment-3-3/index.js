const express = require("express");
const fs = require("fs")
const app = express();
const PORT = 3000;

app.use(express.json());

const DB_File = require("./db.json");
const { error } = require("console");

const readDB = ()=>{
    const data = fs.readFileSync(DB_File,"utf-8");
    return JSON.parse(data);
};

const writeDB = ()=>{
    fs.writeFileSync(DB_File,JSON.stringify(data,null,2),"utf-8");
}

app.post("/dishes",(req,res)=>{
    try{
        const {id,name,price,category} = req.body;
        if(!id || !name || !price || !category){
            return res.status(400).json({message: "All Fildes are required"});
        }

        const db = readDB();
        db.dishes.push({id,name,price,category});
        writeDB();
        res.status(201).json({message:"dish added successfully!!", dish:{id,name,price,category}});
    }catch(err){
        res.status(500).json({error:"Server Error"});
    }
});


app.get("dishes",(req,res)=>{
    try{
        const db = readDB();
        res.status(200).json(db.dishes);
    }catch(err){
        res.json(500).json({error:"Server Error"});
    }
});


// get dish by-id;

app.get("dishes/:id",(req,res)=>{
    try{
        const db = readDB();
        const   dish = db.dishes.findIndex(d=> d.id === req.params.id)

        if(!dish){
            return res.status(404).json({message:"Dish Not Found"});
        }
        res.status(200).json(dish);
    }catch(err){
        res.status(500).json({message:"Server error"});
    }
});

// update dish by id

app.put("/dishes/:id",(req,res)=>{
    
})