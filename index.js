const express = require("express");
const mongoose = require("mongoose");
const path = require('path');

const app = express()
app.set("view engine", "ejs");
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