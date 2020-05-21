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

// Home Route
app.get('/', function(req, res) {
  let articles = [
    {
      id: 1,
      title: 'Article One',
      author: 'Denis',
      body: 'This is article one'
    },
    {
      id: 2,
      title: 'Article Two',
      author: 'Jacob',
      body: 'This is article two'
    },
    {
      id: 3,
      title: 'Article Three',
      author: 'Sam',
      body: 'This is article three'
    }
  ]
  res.render('index', {
    title: 'Articles',
    articles: articles
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