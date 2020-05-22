const express = require('express')
const path = require('path');
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
const session = require('express-session')

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

// Express Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}))

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    var namespace = param.split('.')
    , root        = namespace.shift()
    , formParam   = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}))

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

// Route Files
const article = require('./routes/articles')
app.use('/articles', article)

// Start Server
app.listen(3000, function() {
  console.log('server started on port 3000')
});