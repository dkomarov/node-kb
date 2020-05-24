const express = require('express')
const router = express.Router();
const bcrypt = require('bcryptjs')
const passport = require('passport')

// bring in user model
const User = require('../models/user');

// Register form
router.get('/register', function(req, res){
  res.render('register', {title: 'Register'})
})

// Register process
router.post('/register', function(req, res){
  let name = req.body.name;
  let email = req.body.email;
  let username = req.body.username;
  let password = req.body.password;
  let password2 = req.body.password2;

  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(password);

  let errors = req.validationErrors();

  if (errors) {
    res.render('register', {
      errors: errors
    })
  } else {
    let newUser = new User({
      name:name,
      email:email,
      username:username,
      password:password
    })

    bcrypt.genSalt(10, function(err, salt){
      bcrypt.hash(newUser.password, salt, function(err, hash){
        if (err){
          console.log(err);
        }
        newUser.password = hash;
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
    });
  }
});

// Login form
router.get('/login', function(req, res){
  res.render('login', {title: 'Login'})
})

// Login process
router.post('/login', function(req, res, next){
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
})

// Logout
router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', 'You are logged out.')
  res.redirect('/users/login')
})

module.exports = router;