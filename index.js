const express = require("express");
const mongoose = require("mongoose");
const path = require('path');
var bodyParser=require("body-parser");

const app = express()
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.set('views', path.join(__dirname, '/views'));

mongoose.connect("mongodb://127.0.0.1:27017/IMDBdb")

//creating schemas for all the APIs

const userSchema = new mongoose.Schema({
    user_name: String,
    password: String,
});

const User = mongoose.model("User", userSchema);

const genreSchema = new mongoose.Schema({
    genre_name: String,
    creator_ID: String,  //same as userID who added the genre
});

const Genre = mongoose.model("Genre", genreSchema);

//get list of genre for movies schema

const genres = [] 

Genre.find().then(data => {
    data.map((d,k) => {
        genres.push(d.genre_name);
    })
});

const movieSchema = new mongoose.Schema({
    name: String,
    description: String,
    release_date: Date,
    genre: {
        type: String,
        enum: genres
    }
})

const Movie = mongoose.model("Movie", movieSchema);

const reviewSchema = new mongoose.Schema({
    user_ID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    movie_ID: {
        type: mongoose.Schema.Types.ObjectID,
        ref: 'Movie'
    },
    comment: String,
    Rating: {
        type: Number,
        min: 1,
        max: 5,
    },
})

const Review = mongoose.model("Review", reviewSchema);

//server

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

//to add user

app.get("/addUser", function(req,res){
    res.render("addUser", {appTitle: "Add User"})
})

app.post("/addUser", function(req, res){
    var username=req.body.username;
    var password=req.body.password;

    const user = new User({
        user_name: username,
        password: password,
    })

    user.save()
})

//check login

app.get("/login", function(req, res){
    res.render("login", {appTitle: "Login"})
})

app.post("/login", async function(req, res){
    var username=req.body.username;
    var password=req.body.password;
    var redirect = false
    user_id = ''

    await User.find().then(users => {
        users.map((d,k) => {
            if(d.user_name == username && d.password == password){
                redirect = true;
                user_id = d._id;
            }
        })
    })
    
    if(redirect){
        res.redirect(`/:${user_id}`)
    }
    else{
        res.send("user not found")
    }
})

app.get("/:userID", function(req, res){
    res.render("user_menu")
})

app.get("/:userID/api/addMovie", function(req, res){
    res.render("addMovie", {appTitle: "Add Movies", genres: genres})
});

app.post("/addMovie", function(req, res){
    var movie_name=req.body.movie_name;
    var description=req.body.description;
    var release_date = req.body.release_date;
    var genre = req.body.genre;
    
    const movie = new Movie({
        name: movie_name,
        description: description,
        release_date: release_date,
        genre: genre
    })

    movie.save()
});

app.get("/:userID/api/addGenre", function(req, res){
    res.render("addGenre", {appTitle: "Add Genre", userPath: `/${req.params.userID}/api/addGenre`})
});

app.post("/:userID/api/addGenre", function(req, res){
    var genre = req.body.genre;

    const genre_db = new Genre({
        genre_name: genre,
        creator_ID: req.params.userID,
    })

    genre_db.save()
})