const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Student = require('../models/studentModel');
const User = require('../models/userModel');
const Resource = require('../models/resourceModel');
const Event = require('../models/eventModel');
const ForumPost = require('../models/forumPostModel');
const Notification = require('../models/notificationModel');
const Review = require('../models/reviewModel'); // ← ADDED

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/uni-connect';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected. Clearing existing data...');

  await Promise.all([
    User.deleteMany({}),
    Student.deleteMany({}),
    Resource.deleteMany({}),
    Event.deleteMany({}),
    ForumPost.deleteMany({}),
    Notification.deleteMany({}),
    Review.deleteMany({})  // ← ADDED
  ]);

  // ── Students (unchanged — referenced by other team members) ──────────────
  const studentDocs = await Student.insertMany([
    {
      name: 'Alex Johnson',
      email: 'alex.johnson@deakin.edu.au',
      university: 'Deakin University',
      course: 'Bachelor of Computer Science',
      year: 2,
      unitCodes: ['SIT123', 'SIT234', 'SIT764'],
      skills: ['JavaScript', 'Python'],
      interests: ['AI', 'Web Development'],
      bio: 'Second year CS student. Into AI stuff and building web apps on the side.'
    },
    {
      name: 'Emma Wilson',
      email: 'emma.wilson@deakin.edu.au',
      university: 'Deakin University',
      course: 'Bachelor of Computer Science',
      year: 2,
      unitCodes: ['SIT234', 'SIT764'],
      skills: ['Python', 'Docker'],
      interests: ['Cloud', 'Open Source'],
      bio: 'Mostly interested in DevOps and cloud stuff. Love automating things.'
    },
    {
      name: 'Sarah Chen',
      email: 'sarah.chen@deakin.edu.au',
      university: 'Deakin University',
      course: 'Bachelor of Computer Science',
      year: 3,
      unitCodes: ['SIT123', 'SIT234'],
      skills: ['Java', 'SQL'],
      interests: ['Databases', 'Backend'],
      bio: 'Final year, trying to survive SIT123. Looking for internships.'
    },
    {
      name: 'Marcus Williams',
      email: 'marcus.williams@deakin.edu.au',
      university: 'Deakin University',
      course: 'Bachelor of Software Engineering',
      year: 2,
      unitCodes: ['SIT234', 'SIT764'],
      skills: ['C++', 'Python'],
      interests: ['Systems', 'HPC'],
      bio: 'Big fan of low-level programming. Currently obsessed with parallel computing.'
    },
    {
      name: 'Sahan Rathnayake',
      email: 'sahan.r@deakin.edu.au',
      university: 'Deakin University',
      course: 'Bachelor of Computer Science',
      year: 1,
      unitCodes: ['SIT123'],
      skills: ['Python'],
      interests: ['Machine Learning', 'Data Science'],
      bio: 'First year, still figuring things out. Really want to get into ML.'
    }
  ]);

  const alex   = studentDocs.find(s => s.name === 'Alex Johnson');
  const emma   = studentDocs.find(s => s.name === 'Emma Wilson');
  const sarah  = studentDocs.find(s => s.name === 'Sarah Chen');
  const marcus = studentDocs.find(s => s.name === 'Marcus Williams');
  const sahan  = studentDocs.find(s => s.name === 'Sahan Rathnayake');

  // ── Resources (unchanged) ─────────────────────────────────────────────────
  await Resource.insertMany([
    {
      title: 'SIT123 Week 3 Notes - Agile & Sprints',
      description: 'My notes from week 3 lectures. Covers sprint planning and reviews. Might have a few gaps but should be useful.',
      type: 'notes', unitCode: 'SIT123',
      uploadedBy: sarah._id, tags: ['agile', 'planning'],
      downloadCount: 47, createdAt: new Date('2026-05-07')
    },
    {
      title: 'SIT234 Parallel Computing Quick Guide',
      description: 'Put this together when studying for the mid-sem. Covers OpenMP basics and a bit of MPI.',
      type: 'guide', unitCode: 'SIT234',
      uploadedBy: marcus._id, tags: ['parallel', 'OpenMP'],
      downloadCount: 31, createdAt: new Date('2026-05-05')
    },
    {
      title: 'SIT764 Capstone Requirements 2026',
      description: 'Official rubric from the unit guide. Pasted it here so its easier to find.',
      type: 'guide', unitCode: 'SIT764',
      uploadedBy: alex._id, tags: ['capstone', 'rubric'],
      downloadCount: 28, createdAt: new Date('2026-05-03')
    },
    {
      title: 'ML Algorithms Cheat Sheet',
      description: 'Quick summary of common algorithms - when to use what, pros/cons. Mostly from lecture slides and YouTube.',
      type: 'notes', unitCode: 'SIT123',
      uploadedBy: sahan._id, tags: ['ML', 'algorithms'],
      downloadCount: 62, createdAt: new Date('2026-05-08')
    },
    {
      title: 'SIT123 Past Exam 2025',
      description: 'Found this on the library portal. Has worked answers for most questions.',
      type: 'past-exam', unitCode: 'SIT123',
      uploadedBy: sarah._id, tags: ['exam', 'revision'],
      downloadCount: 89, createdAt: new Date('2026-05-04')
    }
  ]);

  // ── Events (unchanged) ────────────────────────────────────────────────────
  const events = await Event.insertMany([
    {
      title: 'Deakin Tech Networking Night',
      description: 'Meet people from industry and other students. Free food apparently.',
      type: 'networking', organizer: 'Deakin IT Society',
      date: new Date('2026-05-15'), location: 'Geelong Waterfront Campus',
      tags: ['networking'], unitCodes: ['SIT764'],
      registeredStudents: [alex._id, sarah._id],
      status: 'pending'
    },
    {
      title: 'ML Workshop - Supervised Learning',
      description: 'Hands-on session, bring your laptop. Going through model training and evaluation.',
      type: 'workshop', organizer: 'Deakin AI Club',
      date: new Date('2026-05-12'), location: 'Online', isOnline: true,
      tags: ['Machine Learning', 'AI'], unitCodes: ['SIT123'],
      registeredStudents: [alex._id, sahan._id, emma._id],
      status: 'pending'
    },
    {
      title: 'Student Hackathon 2026',
      description: '48 hours to build something. Open to all students. Teams of 2-4.',
      type: 'competition', organizer: 'Deakin Innovation Hub',
      date: new Date('2026-06-01'), location: 'Melbourne Burwood Campus',
      tags: ['hackathon'],
      registeredStudents: [alex._id, sarah._id],
      status: 'pending'
    },
    {
      title: 'IT & Engineering Career Fair',
      description: 'Heaps of companies coming. Good chance to drop your resume and chat to people.',
      type: 'career', organizer: 'Deakin Careers',
      date: new Date('2026-05-25'), location: 'Melbourne Burwood Campus',
      tags: ['careers', 'internship'],
      registeredStudents: [alex._id, sarah._id, marcus._id],
      status: 'pending'
    },
    {
      title: 'SIT123/SIT712 - Study Group',
      description: 'Weekly meetup to work through assignments. Jump in if you want.',
      type: 'study', organizer: 'Student-led',
      date: new Date('2026-05-11'), location: 'Online', isOnline: true,
      tags: ['SIT123'], unitCodes: ['SIT123'],
      registeredStudents: [alex._id, sahan._id, sarah._id],
      status: 'pending'
    }
  ]);

  // ── Forum posts (unchanged) ───────────────────────────────────────────────
  await ForumPost.insertMany([
    {
      title: 'Anyone else struggling with the SIT123 project scope?',
      content: 'Our team keeps adding stuff we don\'t need. How do you stop that from happening? We\'re already behind.',
      author: alex._id, unitCode: 'SIT123', tags: ['project', 'agile'],
      replies: 12, likes: 8, views: 94, createdAt: new Date('2026-05-06')
    },
    {
      title: 'Good SIT234 resources beyond the slides?',
      content: 'The lecture slides aren\'t enough for OpenMP. Anyone found anything actually helpful?',
      author: marcus._id, unitCode: 'SIT234', tags: ['parallel', 'OpenMP'],
      replies: 8, likes: 5, views: 61, createdAt: new Date('2026-05-07')
    },
    {
      title: 'Looking for SIT764 capstone team members',
      content: 'Want to build something ML related. If you\'re interested flick me a message. Need 1-2 more people.',
      author: emma._id, unitCode: 'SIT764', tags: ['capstone', 'team'],
      replies: 15, likes: 11, views: 132, createdAt: new Date('2026-05-05')
    },
    {
      title: 'My loss curve keeps exploding - help?',
      content: 'Trying to implement gradient descent from scratch for SIT123. Loss goes to NaN after like 10 epochs. Is it the learning rate?',
      author: sahan._id, unitCode: 'SIT123', tags: ['Python', 'ML'],
      replies: 6, likes: 9, views: 48, createdAt: new Date('2026-05-08')
    },
    {
      title: 'React or Vue for the capstone?',
      content: 'Can\'t decide between the two for our SIT764 frontend. What would you go with?',
      author: sarah._id, unitCode: 'SIT764', tags: ['React', 'frontend'],
      replies: 20, likes: 14, views: 187, createdAt: new Date('2026-05-04')
    }
  ]);

  // ── Notifications (unchanged) ─────────────────────────────────────────────
  await Notification.insertMany([
    {
      studentId: alex._id, type: 'forum_reply', read: false,
      title: 'New reply on your post',
      message: 'Sarah Chen replied to "Anyone else struggling with the SIT123 project scope?"',
      createdAt: new Date('2026-05-10T08:00:00')
    },
    {
      studentId: alex._id, type: 'event', read: false,
      title: 'ML Workshop is tomorrow',
      message: 'Don\'t forget - ML Workshop starts tomorrow at 6pm.',
      createdAt: new Date('2026-05-10T02:00:00')
    },
    {
      studentId: alex._id, type: 'resource', read: false,
      title: 'New resource for SIT123',
      message: 'Sahan Rathnayake uploaded: ML Algorithms Cheat Sheet',
      createdAt: new Date('2026-05-09T20:00:00')
    },
    {
      studentId: alex._id, type: 'forum_reply', read: true,
      title: 'Reply on your gradient descent post',
      message: 'Sahan Rathnayake replied to your post about the loss curve.',
      createdAt: new Date('2026-05-09T10:00:00')
    },
    {
      studentId: alex._id, type: 'event', read: true,
      title: 'Career fair coming up',
      message: 'IT & Engineering Career Fair is in 2 weeks. Registrations are open.',
      createdAt: new Date('2026-05-08T12:00:00')
    }
  ]);

  // ── Users ─────────────────────────────────────────────────────────────────
  // Original 5 student accounts are preserved exactly.
  // Added: role field (defaults to 'user') and rootadmin for the admin panel.
  const hashedPassword = await bcrypt.hash('password123', 10);

  const userDocs = await User.insertMany([
    // --- existing student logins (emails/usernames unchanged) ---
    { username: 'alex.johnson',    email: 'alex.johnson@deakin.edu.au',    password: hashedPassword, role: 'user'  },
    { username: 'emma.wilson',     email: 'emma.wilson@deakin.edu.au',     password: hashedPassword, role: 'user'  },
    { username: 'sarah.chen',      email: 'sarah.chen@deakin.edu.au',      password: hashedPassword, role: 'user'  },
    { username: 'marcus.williams', email: 'marcus.williams@deakin.edu.au', password: hashedPassword, role: 'user'  },
    { username: 'sahan.r',         email: 'sahan.r@deakin.edu.au',         password: hashedPassword, role: 'user'  },

    // --- admin moderation test users ---
    { username: 'sahanT',    email: 'sahan@gmail.com',     password: hashedPassword, role: 'user'  },
    { username: 'asangaT',   email: 'asanga@gmail.com',    password: hashedPassword, role: 'user'  },
    { username: 'nishadi',   email: 'nishadi@gmail.com',   password: hashedPassword, role: 'user'  },
    { username: 'berlinda',  email: 'berlinda@gmail.com',  password: hashedPassword, role: 'user'  },
    { username: 'amoda',     email: 'amoda@gmail.com',     password: hashedPassword, role: 'user'  },

    // --- admin account ---
    { username: 'rootadmin', email: 'rootadmin@admin.com', password: hashedPassword, role: 'admin' },
  ]);

  const byName = Object.fromEntries(userDocs.map(u => [u.username, u._id]));

  // ── Reviews / reported content ────────────────────────────────────────────
  // Covers admin moderation scenarios: spam, abusive language,
  // impersonation — useful for testing the Reported Reviews panel.
  await Review.insertMany([
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
    },
    {
      user: byName['berlinda'],
      reviewText: 'Profile bio claims to be a Deakin lecturer but the account is fake.',
      rating: 2,
      reportReason: 'Impersonation',
      reportedAt: new Date()
    },
    {
      user: byName['amoda'],
      reviewText: 'Repeatedly sharing links to pirated textbook PDFs in the resources section.',
      rating: 1,
      reportReason: 'Copyright / piracy',
      reportedAt: new Date()
    }
  ]);

  console.log('Seeded:');
  console.log('  Users:         11  (5 students + 5 moderation test users + 1 admin)');
  console.log('  Students:      5');
  console.log('  Resources:     5');
  console.log('  Events:        5');
  console.log('  Forum posts:   5');
  console.log('  Notifications: 5   (for Alex)');
  console.log('  Reviews:       5   (reported — for admin moderation panel)');
  console.log('\nLogin credentials (all use password: password123):');
  console.log('  --- Student accounts (unchanged) ---');
  console.log('  alex.johnson@deakin.edu.au  <- has notifications & seeded data');
  console.log('  emma.wilson@deakin.edu.au');
  console.log('  sarah.chen@deakin.edu.au');
  console.log('  marcus.williams@deakin.edu.au');
  console.log('  sahan.r@deakin.edu.au');
  console.log('  --- Admin ---');
  console.log('  rootadmin@admin.com         <- role: admin');
  console.log('  --- Moderation test users ---');
  console.log('  sahan@gmail.com, asanga@gmail.com, nishadi@gmail.com,');
  console.log('  berlinda@gmail.com, amoda@gmail.com');

  await mongoose.connection.close();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});