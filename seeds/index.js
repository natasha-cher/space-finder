const mongoose = require('mongoose');
const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;
const dotenv = require('dotenv');

const Studio = require('../models/studio');
const studiospaces = require('./studiospaces');
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/space-finder');
  console.log('mongoose connected successfully');
  await seedDB();
}

const seedDB = async () => {
  await Studio.deleteMany({});
  for (const studiospace of studiospaces) {
    const studio = new Studio({
      name: studiospace.name,
      price: studiospace.price,
      description: studiospace.description,
      location: studiospace.location,
      image: `https://api.unsplash.com/photos/random?client_id=${unsplashAccessKey}&collections=p4e9nqGPzaA`
    });
    try {
      await studio.save();
      console.log(`added ${studiospace.name} to the database`);
    } catch (err) {
      console.log(err);
    }
  }
};
