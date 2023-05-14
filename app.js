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
const studios = require('./routes/studios');
const reviews = require('./routes/reviews');
const catchAsync = require('./helpers/catchAsync');
const Joi = require('joi');
dotenv.config()
const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;

app.set('views', path.join(__dirname, 'views'));

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
      httpOnly: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7
  }
}
app.use(session(sessionConfig))

const Studio = require('./models/studio');
const Review = require('./models/review');

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/space-finder');
  console.log('mongoose connected successfully');
}

app.listen(3000, () => {
  console.log('listening on http://localhost/3000')
});

app.use('/studios', studios );
app.use('/studios/:id/reviews', reviews );
app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})

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
