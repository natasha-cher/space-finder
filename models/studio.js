const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StudioSchema = new Schema ({
  name: String,
  price: String,
  description: String,
  location: String,
  image: String
})

module.exports = mongoose.model('Studio', StudioSchema)
