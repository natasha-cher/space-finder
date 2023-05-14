express = require('express');
const router = express.Router();
const catchAsync = require('../helpers/catchAsync');
const ExpressError = require('../helpers/ExpressError');
const Studio = require('../models/studio');
const { studioSchema } = require('../schemas.js');

const validateStudio = (req, res, next) => {
  const { error } = studioSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(',')
    throw new ExpressError(msg, 400)
  } else {
    next();
  }
}

router.get('/', catchAsync(async (req, res) => {
  const studios = await Studio.find({});
  res.render('studios/index', { studios })
}))

router.get('/new', (req, res) => {
  res.render('studios/new')
})

router.post('/', validateStudio, catchAsync(async (req, res, next) => {
  const studio = new Studio(req.body.studio);
  await studio.save();
  req.flash('success', 'Successfully added a studio');
  res.redirect(`studios/${studio._id}`)
}))

router.get('/:id', catchAsync(async (req, res) => {
  const studio = await Studio.findById(req.params.id).populate('reviews');
  if (!studio) {
    req.flash('error', 'Cannot find this page');
    return res.redirect('/studios');
  }
  res.render('studios/show', { studio });
}))

router.get('/:id/edit', catchAsync(async (req, res) => {
  const studio = await Studio.findById(req.params.id);
  if (!studio) {
    req.flash('error', 'Cannot find this page');
    return res.redirect('/studios');
  }
  res.render('studios/edit', { studio });
}))

router.put('/:id', validateStudio, catchAsync(async (req, res) => {
  const { id } = req.params;
  const studio = await Studio.findByIdAndUpdate(id, { ...req.body.studio });
  req.flash('success', 'Updated successfully');
  res.redirect(`/studios/${studio._id}`);
}))

router.delete('/:id', catchAsync(async (req, res) => {
  const { id } = req.params;
  const studio = await Studio.findByIdAndDelete(id);
  req.flash('success', 'Deleted successfully');
  res.redirect('/studios');
}));

module.exports = router;
