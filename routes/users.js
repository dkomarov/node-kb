const express = require('express')
const router = express.Router();
const bcrypt = require('bcryptjs')

// bring in user model
const User = require('../models/user');

// Register form
router.get('/register', function(req, res){
  res.render('register', {title: 'Register'})
})

router.post('/register', function(req, res){

  let name = req.body.name;
  let email = req.body.email;
  let username = req.body.username;
  let pw = req.body.pw;
  let pw2 = req.body.pw2;

  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').isEmail();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('pw', 'Password is required').notEmpty();
  req.checkBody('pw2', 'Passwords do not match').equals(req.body.pw);

  let errors = req.validationErrors();

  if(errors){
    res.render('register', {
      errors: errors
    })
  } else {
    let newUser = new User({
      name:name,
      email:email,
      username:username,
      password:pw
    })

    bcrypt.genSalt(10, function(err, salt){
      bcrypt.hash(newUser.pw, salt, function(err, hash){
        if (err){
          console.log(err);
        } else {
          newUser.pw = hash;
        }
      })
  
      newUser.save(function(err){
        if (err) {
          console.log(err)
          return;
        } else {
          req.flash('success', 'You are now registered and can log in')
          res.redirect('/users/login')
        }
      });
    });
  }
})

// Login form
router.get('/login', function(req, res){
  res.render('login', {title: 'Login'})
})

module.exports = router;