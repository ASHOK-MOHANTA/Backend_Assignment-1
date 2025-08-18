const express = require("express");
const fs = require("fs")
const app = express();
const PORT = 3000;

app.use(express.json());

const DB_File = require("./db.json");
const { error, log } = require("console");

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
    try{
        const db = readDB();
        const dishidx = db.dishes.findIndex(d => d.id === req.params.id);
        if(dishidx === -1){
            res.status(404).json({message:" Dish not not found!!"})
        }

        db.dishes[dishidx] = {...db.dishes[dishidx],...req.body};
        writeDB(db);

        res.status(200).json({message:"Dish Updated Successfully!!",dish : db.dishes[dishidx]});
    }catch(err){
        res.status(500).json({message:"Internal Server Errr..."});
    }
})

// delete dish by id

app.delete("/dishes/:id",(req,res)=>{
    try{
        const db = readDB();
        const newDesh = db.dishes.filter(d => d.id != req.params.id);

        if(newDesh.length === db.dishes.length){
            res.status(404).json({message:"Dish Not Found!!"});
        }

        db.dishes = newDesh;
        writeDB(db);
        res.status(200).json({message:"Dish Deleted Successfully!!"})
    }catch(err){
        res.status(500).json({message:"Server Error"});
    }
})

app.get("/dishes/get",(req,res)=>{
    try{
        const {name} = req.query;

        if(!name){
            return res.status(400).json({message:"Dish query is required"});
        }

        const db = readDB();

        const result = db.dishes.filter(d => d.name.toLowerCase().includes(name.toLocaleLowerCase()));

        if(result.length == 0){
            return res.status(400).json({message:"No dish Found!!"})
        }

        res.status(200).json(result);
    }catch(err){
        res.status(404).json({message:"Server Error!!"});
    };
});

// undefind routs

app.use((req,res)=>{
    res.status(404).json({message:"404 not found!!"});
});

app.listen(PORT,()=>{
    console.log(`Server is running at ${PORT}`);
    
})