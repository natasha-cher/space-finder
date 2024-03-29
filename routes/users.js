express = require('express');
const router = express.Router();
const catchAsync = require('../helpers/catchAsync');
const ExpressError = require('../helpers/ExpressError');
const User = require('../models/user');
const passport = require('passport');
const LocalStrategy = require('passport-local');

const { userSchema } = require('../schemas.js');

router.get('/register', (req, res) => {
  res.render('users/register');
});

router.post('/register', catchAsync(async (req, res, next) => {
  try {
      const { email, username, password } = req.body;
      const user = new User({ email, username });
      const registeredUser = await User.register(user, password);
      req.login(registeredUser, err => {
          if (err) return next(err);
          req.flash('success', 'Welcome to Space Finder!');
          res.redirect('/studios');
      })
  } catch (e) {
      req.flash('error', e.message);
      res.redirect('/register');
  }
}));

router.get('/login', (req, res) => {
  res.render('users/login');
})

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
  req.flash('success', 'Welcome back!');
  const redirectUrl = req.session.returnTo || '/studios';
  delete req.session.returnTo;
  res.redirect('/studios');
})

router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', "Goodbye!");
  res.redirect('/studios');
})

module.exports = router;
