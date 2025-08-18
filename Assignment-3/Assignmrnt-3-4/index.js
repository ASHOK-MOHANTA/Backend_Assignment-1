const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json());

const PORT = 3000;

const DBFile = "./db.json"

function readBooks(){
    try{
        return JSON.parse(fs.readFileSync(DBFile,"utf-8"));
    }catch(err){
        return [];
    }
}

// write book;

function writeBook(book){
    fs.writeFileSync(DBFile,JSON.stringify(book,null,2),"utf-8");
}

// add a new book

app.post("/books",(req,res)=>{
    const books = readBooks();

    const newbook = req.body;

    if(!newbook.title || !newbook.author || !newbook.year){
        return res.status(400).json({message:"Title,author,and year are required"});
    }

    newbook.id = books.length ? books[books.length -1].id : 1;
    books.push(newbook);
    writeBook(books);

    res.status(201).json({newbook});
});

// Retrive all book

app.get("/books",(req,res)=>{
    const books = readBooks();
    res.status(200).json(books);
});


// Retrive book by id

app.get("/books/:id",(req,res)=>{
    const books = readBooks();

    const book = books.find((b)=> b.id === parseInt(req.params.id))

    if(!book){
        return res.status(404).json({message:"Book Not Found"});
    }

    res.status(200).json(book)
});

// Update by id

app.put("/books/:id",(req,res)=>{
    const books = readBooks();

    const bookIdx =    books.findIndex((b)=> b.id === parseInt(req.params.id));
    if(bookIdx == -1){
        return res.status(404).json({message:"Book Not Found"})
    }

    const updateBook = {...books[bookIdx],...req.body,id:books[bookIdx].id}

    books[bookIdx] = updateBook;
    writeBook(books);

    res.status(200).json(updateBook);
})

// delete by id

app.delete("/books/:id",(req,res)=>{
  let books = readBooks();
  const bookIdx = books.findIndex((b)=> b.id === parseInt(req.params.id));

  if(bookIdx === -1){
    return res.status(404).json({message:"Book not found"});
  }

  const deletedBook = books.splice(bookIdx,1);
  writeBook(books)
    res.status(200).json(deletedBook[0]);
});


// search by auther or title

app.get("/books/search",(req,res)=>{
    const {author,title} = req.query;

    const  books = readBooks();

    let results = books;

    if(author){
        results = results.filter((b)=>{
            b.author.toLowerCase().includes(author.toLowerCase())
        });
    }
    if(title){
        results = results.filter((b)=>{
            b.title.toLowerCase().includes(title.toLowerCase());
        });
    }

    if(results.length == 0){
        return res.status(404).json({message:"No book found"})
    }

    res.status(200).json(results);


});

app.use((req,res)=>{
    res.status(404).json({message:"404 Not found"})
})

app.listen(PORT,()=>{
    console.log(`App is running at ${PORT}`)
})