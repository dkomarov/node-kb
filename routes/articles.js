const express = require('express')
const router = express.Router();
const Article = require('../models/article')

// Add Route
router.get('/add', function(req, res){
  res.render('add_article', {
    title: 'Add article'
  });
})

// Load Edit Form
router.get('/edit/:id', function(req, res) {
  Article.findById(req.params.id, function(err, article){
    res.render('edit_article', {
      title: 'Edit Article',
      article: article
    })
    return;
  });
});

// Submit POST Route
router.post('/add', function(req, res){
  req.checkBody('title', 'Title is required.').notEmpty();
  req.checkBody('author', 'Author is required.').notEmpty();
  req.checkBody('body', 'Body is required.').notEmpty();

  // Get Errors
  let errors = req.validationErrors();

  if(errors){
    res.render('add_article', {
      title: 'Add article',
      errors: errors
    })
  } else {
    let article = new Article();
    article.title = req.body.title;
    article.author = req.body.author;
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
      req.flash('success', 'Article updated.')
      res.redirect('/');
    }

    console.log(req.body.title, 'updated.')
  });
});

// Delete article route
router.delete('/:id', function(req, res){
  let query = {_id: req.params.id}

  Article.deleteOne(query, function(err){
    if(err){
      console.log(err);
    }
    res.send('Success')
  });
});


// Get Single Article
router.get('/:id', function(req, res) {
  Article.findById(req.params.id, function(err, article){
    res.render('article', {
      article: article
    })
    return;
  });
});

module.exports = router;
