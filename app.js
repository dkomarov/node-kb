const express = require('express')
const path = require('path');
const mongoose = require('mongoose')

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
})

// Check for db errors
db.on('error', function(err) {
  console.log(err)
})
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

// Add Route
app.get('/articles/add', function(req, res){
  res.render('add_article', {
    title: 'Add article'
  });
})

// Start Server
app.listen(3000, function() {
  console.log('server started on port 3000')
})