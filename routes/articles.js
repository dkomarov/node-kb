const express = require('express')
const router = express.Router();

// bring in article model
const Article = require('../models/article_model')

// bring in user model
const User = require('../models/user_model')

// Add Route
router.get('/add', ensureAuth, function(req, res){
  res.render('add_article', {
    title: 'Add article'
  });
})

// Load Edit Form
router.get('/edit/:id', ensureAuth, function(req, res) {
  Article.findById(req.params.id, function(err, article){
   if (article.author != req.user._id) {
      req.flash('danger', 'Not Authorized');
      return res.redirect('/')
    }
    res.render('edit_article', {
      title: 'Edit Article',
      article: article
    });
  });
});

// Submit POST Route
router.post('/add', function(req, res){
  req.checkBody('title', 'Title is required.').notEmpty();
  // req.checkBody('author', 'Author is required.').notEmpty();
  req.checkBody('body', 'Body is required.').notEmpty();

  // Get Errors
  let errors = req.validationErrors();

  if(errors){
    res.render('add_article', {
      title: 'Add article',
      article: req.body,
      errors: errors
    })
  } else {
    let article = new Article();
    article.title = req.body.title;
    article.author = req.user._id; // get author from user object
    article.body = req.body.body;
  
    article.save(function(err){
      if(err){
        console.log(err);
        return;
      } else {
        req.flash('success', 'Article added.')
        res.redirect('/');
      }
      console.log(req.body.title, 'added.')
    });
    return;
  }

});

// Update Submit POST Route
router.post('/edit/:id', function(req, res){
  let uid = req.user._id
  if(!uid){ // if user not logged in
    res.status(500).send();
  } else {

    let query = {_id:req.params.id}

    Article.findById(req.params.id, function(err, article){
      if (err) {
        console.log(err)
      } else if (article.author != uid) { // if user does not own article
        res.status(500).send();
      } else {
        let article = {};
        article.title = req.body.title;
        article.body = req.body.body;
        Article.updateOne(query, article, function(err){
          if(err){
            console.log(err);
            return;
          } else {
            req.flash('success', 'Article updated.')
            res.redirect('/');
          }
          console.log(req.body.title, 'updated.')
        });
      }
      });
    }
});

// Delete article route
router.delete('/:id', function(req, res){
  let uid = req.user._id
  if(!uid){ // if user not logged in
    res.status(500).send();
  } else {
    let query = {_id: req.params.id}

    Article.findById(req.params.id, function(err, article){
      if (err) {
        console.log(err)
      } else if (article.author != uid) { // if user does not own article
        res.status(500).send();
      } else {
        Article.deleteOne(query, function(err){
          if(err){
            console.log(err)
          }
          res.send('Success')
          });
        }
      });
    }
});


// Get Single Article
router.get('/:id', function(req, res) {
  Article.findById(req.params.id, function(err, article){
    User.findById(article.author, function (err, user) {
      res.render('article', {
        article: article,
        author: user.name
      })
      return;
      
    })
  });
});

// Access Control
function ensureAuth(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('danger', 'Please login')
    res.redirect('/users/login')
  }
}

module.exports = router;
