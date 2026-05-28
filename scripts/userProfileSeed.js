// userProfileSeed.js 
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');          // ← ADD THIS
const User     = require('../models/userModel'); 
const Review   = require('../models/reviewModel'); 

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/uni-connect'; 

async function seed() { 
  await mongoose.connect(MONGO_URI); 
  console.log('Connected to MongoDB'); 

  // ← ADD THIS before insertMany
  const hashedPassword = await bcrypt.hash('password123', 10);

  const userData = [ 
    { username: 'sahanT',    email: 'sahan@gmail.com',     password: hashedPassword, role: 'user'  }, 
    { username: 'asangaT',   email: 'asanga@gmail.com',    password: hashedPassword, role: 'user'  }, 
    { username: 'nishadi',   email: 'nishadi@gmail.com',   password: hashedPassword, role: 'user'  }, 
    { username: 'berlinda',  email: 'berlinda@gmail.com',  password: hashedPassword, role: 'user'  }, 
    { username: 'amoda',     email: 'amoda@gmail.com',     password: hashedPassword, role: 'user'  }, 
    { username: 'rootadmin', email: 'rootadmin@admin.com', password: hashedPassword, role: 'admin' }, 
  ];

  const users = await User.insertMany(userData); 
  console.log(`Seeded ${users.length} users`); 

  const byName = Object.fromEntries(users.map(u => [u.username, u._id])); 

  const reviewData = [ 
    { 
      user: byName['sahanT'], 
      reviewText: 'User is sending messages saying "Earn a lot by clicking this link!"', 
      reportReason: 'Spam / advertising', 
      rating: 5,
      reportedAt: new Date()
    }, 
    { 
      user: byName['asangaT'], 
      reviewText: 'Posted a thread "BUY CHEAP FOLLOWERS NOW!!"', 
      rating: 1, 
      reportReason: 'Spam / advertising', 
      reportedAt: new Date() 
    }, 
    { 
      user: byName['nishadi'], 
      reviewText: 'Commenting "This is complete rubbish. The organiser is an idiot."', 
      rating: 1, 
      reportReason: 'Abusive / hateful language', 
      reportedAt: new Date() 
    } 
  ]; 

  const reviews = await Review.insertMany(reviewData); 
  console.log(`Seeded ${reviews.length} reviews`); 

  await mongoose.connection.close(); 
  console.log('User & review seeding complete – connection closed'); 
} 

seed().catch((err) => { 
  console.error('Seeding error:', err.message); 
  process.exit(1); 
});
 