const express = require('express')
const path = require('path');
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
const session = require('express-session')
const passport = require('passport')
const config = require('./config/database')

mongoose.connect(config.database, {
  useNewUrlParser: true,  
  useUnifiedTopology: true 
});

let db = mongoose.connection;

// Check connection
// db.once('open', function(){
//   console.log('Connected config to MongoDB')
// });

// Check for db errors
db.on('error', function(err) {
  console.log(err)
});

const Article = require('./models/article_model')
const User = require('./models/user_model')

if (process.env.NODE_ENV !== 'production') { // set by default by Node
  require('dotenv').config({path: '.env'})
}

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,  
  useUnifiedTopology: true 
});

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
}));

// Passport Config
require('./config/passport')(passport)

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
});

// Route Files
const articles = require('./routes/articles')
const users = require('./routes/users')
app.use('/articles', articles)
app.use('/users', users)

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

// Start Server
app.listen(3000, function() {
  console.log('Server started on: http://localhost:3000')
});