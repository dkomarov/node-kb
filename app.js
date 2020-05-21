const express = require('express')
const path = require('path');
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

if (process.env.NODE_ENV !== 'production') { // set by default by Node
  require('dotenv').config({path: '.env'})
}

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,  
  useUnifiedTopology: true 
});

let db = mongoose.connection;

// Check connection
db.once('open', function(){
  console.log('Connected to MongoDB')
});

// Check for db errors
db.on('error', function(err) {
  console.log(err)
});
// Init app
const app = express();

// Load View Engine
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')))

// Bring in Models
const Article = require('./models/article')

// Home Route
app.get('/', function(req, res) {
  Article.find({}, function(err, articles){
    if (err){
      console.log(err)
    } else {
    res.render('index', {
      title: 'Articles',
      articles: articles
    });
  }
  });
});

// Get Single Article
app.get('/article/:id', function(req, res) {
  Article.findById(req.params.id, function(err, article){
    res.render('article', {
      article: article
    })
    return;
  });
});

// Add Route
app.get('/articles/add', function(req, res){
  res.render('add_article', {
    title: 'Add article'
  });
})

// Load Edit Form
app.get('/article/edit/:id', function(req, res) {
  Article.findById(req.params.id, function(err, article){
    res.render('edit_article', {
      title: 'Edit Article',
      article: article
    })
    return;
  });
});

// Submit POST Route
app.post('/articles/add', function(req, res){
  let article = new Article();
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  article.save(function(err){
    if(err){
      console.log(err);
      return;
    } else {
      res.redirect('/');
    }
    console.log(req.body.title, 'added.')
  });
  return;
});

// Update Submit POST Route
app.post('/articles/edit/:id', function(req, res){
  let article = {};
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  let query = {_id:req.params.id}

  Article.updateOne(query, article, function(err){
    if(err){
      console.log(err);
      return;
    } else {
      res.redirect('/');
    }

    console.log(req.body.title, 'updated.')
  });
});

// Delete article route
app.delete('/article/:id', function(req, res){
  let query = {_id: req.params.id}

  Article.deleteOne(query, function(err){
    if(err){
      console.log(err);
    }
    res.send('Success')
  });
});

// Start Server
app.listen(3000, function() {
  console.log('server started on port 3000')
});