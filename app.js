const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const mongoose = require('mongoose');

const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const dotenv = require('dotenv');
const ExpressError = require('./helpers/ExpressError');
const { studioSchema, reviewSchema } = require('./schemas.js');

const studioRoutes = require('./routes/studios');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

const catchAsync = require('./helpers/catchAsync');
const Joi = require('joi');
dotenv.config()
const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;
const sessionSecret = process.env.SESSION_SECRET;
const passport = require('passport');
const LocalStrategy = require('passport-local');

const Studio = require('./models/studio');
const Review = require('./models/review');
const User = require('./models/user');

app.set('views', path.join(__dirname, 'views'));

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));


const sessionConfig = {
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: {
      httpOnly: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7
  }
}
app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/space-finder');
  console.log('mongoose connected successfully');
}

app.use('/studios', studioRoutes );
app.use('/users', userRoutes );
app.use('/studios/:id/reviews', reviewRoutes );

app.get('/', (req, res) => {
  res.render('home')
});


app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Something Went Wrong...'
  res.status(statusCode).render('error', { err })
})

app.use((req, res) => {
  res.status(404).send('Not Found');
})

app.listen(3000, () => {
  console.log('listening on http://localhost:3000/')
});
