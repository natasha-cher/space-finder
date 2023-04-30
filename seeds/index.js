const mongoose = require('mongoose');
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
      location: studiospace.location
    });
    try {
      await studio.save();
      console.log(`added ${studiospace.name} to the database`);
    } catch (err) {
      console.log(err);
    }
  }
};
