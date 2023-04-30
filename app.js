const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
// app.use(methodOverride('_method'));

const Studio = require('./models/studio');
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
})

app.get('/studios', async (req, res) => {
  const studios = await Studio.find({});
  res.render('studios/index', { studios })
});

app.get('/studios/new', (req, res) => {
  res.render('studios/new')
})
