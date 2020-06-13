const express = require('express')
const path = require('path');
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const session = require('express-session')
const passport = require('passport')
const config = require('./config/database')
// const { check, validationResult } = require('express-validator')

const env = process.env.NODE_ENV ? process.env.NODE_ENV : "development" || "production";
const port = process.env.PORT;
const host = process.env.HOST;
const live = process.env.LIVE;
const debug = require('debug');


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

// check which environment is active (e.g. production)
if (process.env.NODE_ENV !== 'production') { // set by default by Node
  require('dotenv').config({path: '.env'})

  mongoose.connect(config.database, {
    useNewUrlParser: true,  
    useUnifiedTopology: true 
  });

  mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,  
    useUnifiedTopology: true 
  });

} else {

  mongoose.connect('mongodb+srv://user2:'+ process.env.MONGO_ATLAS +'@cluster0-cxz4x.mongodb.net/node-kb?retryWrites=true&w=majority', {
    useNewUrlParser: true,  
    useUnifiedTopology: true 
  });
}

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

app.set('port', port);

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

// // Express Validator Middleware
// app.use(expressValidator({
//   errorFormatter: function(param, msg, value) {
//     var namespace = param.split('.'),
//              root = namespace.shift(),
//         formParam = root;

//     while(namespace.length) {
//       formParam += '[' + namespace.shift() + ']';
//     }
//     return {
//       param : formParam,
//       msg   : msg,
//       value : value
//     };
//   }
// }));

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

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

var server = app.listen(port, function(){
  if (env != 'production') {
    console.log(`\nServer is running in ${env}. To connect, go to: http://${host}\n`);
  } else {
    console.log(`\nServer is running in ${env}. To connect, go to: https://${live}\n`);
  }
})

server.on('error', onError);
server.on('listening', onListening);

module.exports = { env: process.env };