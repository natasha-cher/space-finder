const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;
const nodeFetch = require('node-fetch');
const fetch = (...args) => require('node-fetch').default(...args);
globalThis.fetch = fetch;
globalThis.Headers = fetch.Headers;
globalThis.Request = fetch.Request;
globalThis.Response = fetch.Response;

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
    try {
      const res = await fetch(`https://api.unsplash.com/photos/random?client_id=${unsplashAccessKey}&collections=p4e9nqGPzaA`);
      const data = await res.json();
      const url = data.urls.full;
      const studio = new Studio({
        name: studiospace.name,
        price: studiospace.price,
        description: studiospace.description,
        location: studiospace.location,
        image: url
      });
      await studio.save();
      console.log(`added ${studiospace.name} to the database`);
    } catch (err) {
      console.log(err);
    }
  }
};
