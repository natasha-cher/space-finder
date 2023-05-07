const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const morgan = require('morgan');
const ejsMate = require('ejs-mate');
const dotenv = require('dotenv');
const ExpressError = require('./helpers/ExpressError');
const { studioSchema } = require('./schemas.js');
const catchAsync = require('./helpers/catchAsync');
const Joi = require('joi');
dotenv.config()
const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;

app.set('views', path.join(__dirname, 'views'));

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const validateStudio = (req, res, next) => {
  const { error } = studioSchema.validate(req.body);
  if (error) {
      const msg = error.details.map(el => el.message).join(',')
      throw new ExpressError(msg, 400)
  } else {
      next();
  }
}

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
      const msg = error.details.map(el => el.message).join(',')
      throw new ExpressError(msg, 400)
  } else {
      next();
  }
}

app.use(morgan('dev'))

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


app.get('/', (req, res) => {
  res.render('home')
});

app.get('/studios', catchAsync(async (req, res) => {
  const studios = await Studio.find({});
  res.render('studios/index', { studios })
}))

app.get('/studios/new', (req, res) => {
  res.render('studios/new')
})

app.post('/studios', validateStudio, catchAsync(async (req, res, next) => {
  const studio = new Studio(req.body.studio);
  await studio.save();
  res.redirect(`studios/${studio._id}`)
}))

app.get('/studios/:id', catchAsync(async (req, res) => {
  const studio = await Studio.findById(req.params.id);
  res.render('studios/show', { studio });
}))

app.get('/studios/:id/edit', catchAsync(async (req, res) => {
  const studio = await Studio.findById(req.params.id);
  res.render('studios/edit', { studio });
}))

app.put('/studios/:id', validateStudio, catchAsync(async (req, res) => {
  const { id } = req.params;
  const studio = await Studio.findByIdAndUpdate(id, { ...req.body.studio });
  res.redirect(`/studios/${studio._id}`);
}))

app.delete('/studios/:id', catchAsync(async (req, res) => {
  const { id } = req.params;
  const studio = await Studio.findByIdAndDelete(id);
  res.redirect('/studios');
}));

app.post('/studios/:id/reviews', validateReview, catchAsync(async (req, res) => {
  const studio = await Studio.findById(req.params.id);
  const review = new Review(req.body.review);
  studio.reviews.push(review);
  await review.save();
  await studio.save();
  res.redirect(`/studios/${studio._id}`);
}))

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
