express = require('express');
const router = express.Router();
const catchAsync = require('../helpers/catchAsync');
const ExpressError = require('../helpers/ExpressError');
const { reviewSchema } = require('../schemas.js');
const Studio = require('../models/studio');
const Review = require('../models/review');

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
      const msg = error.details.map(el => el.message).join(',')
      throw new ExpressError(msg, 400)
  } else {
      next();
  }
}

router.post('/', validateReview, catchAsync(async (req, res) => {
  const studio = await Studio.findById(req.params.id);
  const review = new Review(req.body.review);
  studio.reviews.push(review);
  await review.save();
  await studio.save();
  res.redirect(`/studios/${studio._id}`);
}))

router.delete('/:reviewId', catchAsync(async (req, res) => {
  const { id, reviewId } = req.params;
  await Studio.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  res.redirect(`/studios/${id}`);
}))

module.exports = router;