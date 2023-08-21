const express = require("express");
const mongoose = require("mongoose");
const path = require('path');

const app = express()
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, '/views'));

mongoose.connect("mongodb://127.0.0.1:27017/IMDBdb")

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function (){
    console.log("server started");
})

app.get("/", function(req, res){
    res.render("home", {appTitle: "IMDB clone"});
})