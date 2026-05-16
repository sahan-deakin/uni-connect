const mongoose = require('mongoose');
const SampleModel = require('../models/sampleModel');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/uni-connect';

const seedData = [
  { name: 'SIT374 Study Notes', description: 'Week 1-5 lecture notes for SIT374 at Deakin' },
  { name: 'Career Fair - Melbourne', description: 'Annual engineering career fair at RMIT City Campus' },
  { name: 'Machine Learning Resources', description: 'Curated ML reading list for Monash students' },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  await SampleModel.deleteMany({});
  const inserted = await SampleModel.insertMany(seedData);
  console.log(`Seeded ${inserted.length} records`);

  await mongoose.connection.close();
  console.log('Done');
}

seed().catch((err) => {
  console.error('Seed error:', err.message);
  process.exit(1);
});
