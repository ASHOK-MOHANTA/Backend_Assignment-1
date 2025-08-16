const fs = require("fs")

function readFileData(){
    try{
        const data = fs.readFileSync("data.txt","utf-8");
        console.log("File content is"+data);
    }catch(error){
        console.error("Errror is "+ error);
    }
}

function appendFileData(){
    try{
        fs.appendFileSync("data.txt","\n This is append data1");
    }catch(err){
        console.error("Error appending data:"+ err)
    }
}

module.exports = {
    readFileData,
    appendFileData
};