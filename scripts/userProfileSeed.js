// userProfileSeed.js
const mongoose = require('mongoose');
const User     = require('../models/userModel');
const Review   = require('../models/reviewModel');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/uni-connect';

// Subjected to remove incase alternative profile management is implemented - NEED TO DISCUSS WITH THE TEAM
const userData = [
  { username: 'sahanT',   email: 'sahan@gmail.com',   role: 'user'  },
  { username: 'asangaT', email: 'asanga@gmail.com',     role: 'user'  },
  { username: 'nishadi',   email: 'nishadi@gmail.com',   role: 'user'  },
  { username: 'berlinda',   email: 'berlinda@gmail.com',    role: 'user'  },
  { username: 'amoda',   email: 'amoda@gmail.com',     role: 'user'  },
  { username: 'rootadmin',  email: 'rootadmin@admin.com',   role: 'admin' },
];

// Function to seed users and reviews for testing purposes
async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data (only User + Review)
  await Promise.all([
    User.deleteMany({}),
    Review.deleteMany({})
  ]);
  console.log('Cleared existing users and reviews');

  // Insert users
  const users = await User.insertMany(userData);
  console.log(`Seeded ${users.length} users`);

  // Map username -> _id for reviews
  const byName = Object.fromEntries(users.map(u => [u.username, u._id]));

  // Insert reviews
  const reviewData = [
    {
      user: byName['sahanT'],
      reviewText: 'User is sendeing messages saying "Earn a lot by clicking this link!',
      reportReason: 'Spam / advertising',
      rating: 5
    },
    {
      user: byName['asangaT'],
      reviewText: 'Posted a thread "BUY CHEAP FOLLOWERS NOW!!" ',
      rating: 1,
      reportReason: 'Spam / advertising',
      reportedAt: new Date()
    },
    {
      user: byName['nishadi'],
      reviewText: 'Commenting in <link> "This is complete rubbish. The organiser is an idiot."',
      rating: 1,
      reportReason: 'Abusive / hateful language',
      reportedAt: new Date()
    }
  ];

  const reviews = await Review.insertMany(reviewData);
  console.log(`Seeded ${reviews.length} reviews (${reviewData.filter(r => r.isReported).length} reported)`);

  await mongoose.connection.close();
  console.log('User & review seeding complete – connection closed');
}

seed().catch((err) => {
  console.error('Seeding error:', err.message);
  process.exit(1);
});