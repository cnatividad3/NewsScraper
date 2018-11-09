const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const cheerio = require("cheerio");

// Require all models
const db = require("./models");

//port
const PORT = process.env.PORT || 3000;

// Initialize Express
const app = express();

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Set Handlebars.
var exphbs = require("express-handlebars");


// Connect to the Mongo DB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

app.get("/scrape", function (req, res) {
  axios.get("https://techcrunch.com/apps").then(function (response) {
    const $ = cheerio.load(response.data);

    $("header.post-block__header").each(function (i, element) {
      var result = {}
      result.title = $(element)
      .find("h2.post-block__title")
      .children("a")
      .text();
      result.link = $(element)
      .children("a")
      .attr("href");
      result.summary = $(element)
      .find("div.post-block__content")
      .children("p")
      .text();

      if (result.title && result.link && result.summary !== "") {

        db.Article
          .create(result)
          .then(function (dbArticle) {
            res.json(dbArticle);
          })
          .catch(function (err) {
            console.log(err);
            res.status(500).json(err);
          })

      }
    });

    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
  db.Article
    .find({})
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      console.log(err);
      res.status(500).json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", (req, res) => {
  db.Article
    .findOne({ _id: req.params.id })

    .populate("notes")
    .then(function (dbArticle) {

      res.json(dbArticle);
    })
    .catch(function (err) {
      console.log(err);
      res.status(500).json(err);
    });
});

app.post("/articles/:id", (req, res) => {
  db.Note
    .create(req.body)
    .then(function (dbNote) {
      return db.Article.findByIdAndUpdate((req.params.id), { $push: { notes: dbNote._id } }, { new: true });
    })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      console.log(err);
      res.status(500).json(err);
    });

});

//delete

app.listen(PORT, function () {
  console.log(`App running on port ${PORT}!`);
})