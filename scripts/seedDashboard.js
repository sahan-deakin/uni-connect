const mongoose = require('mongoose');
const Student = require('../models/studentModel');
const Resource = require('../models/resourceModel');
const Event = require('../models/eventModel');
const ForumPost = require('../models/forumPostModel');
const Notification = require('../models/notificationModel');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/uni-connect';

// Dates relative to seed baseline 2026-05-10
const d = (iso) => new Date(iso);

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected. Clearing existing data...');

  await Promise.all([
    Student.deleteMany({}),
    Resource.deleteMany({}),
    Event.deleteMany({}),
    ForumPost.deleteMany({}),
    Notification.deleteMany({})
  ]);

  // ── Students ────────────────────────────────────────────────────────────────
  const studentDocs = await Student.insertMany([
    {
      name: 'Alex Johnson',
      email: 'alex.johnson@deakin.edu.au',
      university: 'Deakin University',
      course: 'Bachelor of Computer Science',
      year: 2,
      unitCodes: ['SIT374', 'SIT315', 'SIT764'],
      skills: ['JavaScript', 'Python', 'Machine Learning'],
      interests: ['AI', 'Web Development', 'Data Science'],
      bio: 'Second year CS student passionate about AI and web development.',
      connections: []
    },
    {
      name: 'Sarah Chen',
      email: 'sarah.chen@deakin.edu.au',
      university: 'Deakin University',
      course: 'Bachelor of Computer Science',
      year: 2,
      unitCodes: ['SIT374', 'SIT764'],
      skills: ['Python', 'Data Analysis', 'Machine Learning'],
      interests: ['AI', 'Data Science', 'Research'],
      bio: 'Aspiring data scientist with a love for Python and ML.'
    },
    {
      name: 'Marcus Williams',
      email: 'marcus.williams@deakin.edu.au',
      university: 'Deakin University',
      course: 'Bachelor of Information Technology',
      year: 3,
      unitCodes: ['SIT315', 'SIT782'],
      skills: ['Java', 'Cloud Computing', 'Cybersecurity'],
      interests: ['Cloud', 'Security', 'Networking'],
      bio: 'IT professional-in-training focused on cloud and security.'
    },
    {
      name: 'Priya Sharma',
      email: 'priya.sharma@deakin.edu.au',
      university: 'Deakin University',
      course: 'Bachelor of Computer Science',
      year: 2,
      unitCodes: ['SIT764', 'SIT313'],
      skills: ['React', 'Node.js', 'JavaScript'],
      interests: ['Web Development', 'UI/UX', 'Startups'],
      bio: 'Full-stack developer building the web of tomorrow.'
    },
    {
      name: "James O'Brien",
      email: 'james.obrien@deakin.edu.au',
      university: 'Deakin University',
      course: 'Bachelor of Data Science',
      year: 3,
      unitCodes: ['SIT374', 'SIT313'],
      skills: ['R', 'Statistics', 'Machine Learning'],
      interests: ['Data Science', 'AI', 'Research'],
      bio: "Data science enthusiast with a strong statistics background."
    },
    {
      name: 'Emma Wilson',
      email: 'emma.wilson@deakin.edu.au',
      university: 'Deakin University',
      course: 'Bachelor of Computer Science',
      year: 2,
      unitCodes: ['SIT315', 'SIT764'],
      skills: ['Python', 'DevOps', 'Cloud Computing'],
      interests: ['Cloud', 'AI', 'Open Source'],
      bio: 'DevOps enthusiast interested in cloud infrastructure and AI.'
    }
  ]);

  const byName = (name) => studentDocs.find(s => s.name === name);
  const alex   = byName('Alex Johnson');
  const sarah  = byName('Sarah Chen');
  const marcus = byName('Marcus Williams');
  const priya  = byName('Priya Sharma');
  const james  = byName("James O'Brien");
  const emma   = byName('Emma Wilson');

  // Set Alex's existing connections
  await Student.findByIdAndUpdate(alex._id, { connections: [emma._id, priya._id] });

  // ── Resources ───────────────────────────────────────────────────────────────
  await Resource.insertMany([
    {
      title: 'SIT374 Week 3 Project Management Notes',
      description: 'Comprehensive notes covering agile planning and sprint reviews.',
      type: 'notes', unitCode: 'SIT374',
      uploadedBy: sarah._id, tags: ['agile', 'planning'],
      downloadCount: 47, createdAt: d('2026-05-07')
    },
    {
      title: 'Introduction to Parallel Computing — SIT315 Guide',
      description: 'Overview of threading models, OpenMP, and MPI patterns.',
      type: 'guide', unitCode: 'SIT315',
      uploadedBy: marcus._id, tags: ['parallel', 'OpenMP'],
      downloadCount: 31, createdAt: d('2026-05-05')
    },
    {
      title: 'SIT764 Capstone Project Guidelines 2026',
      description: 'Official requirements and marking rubric for the capstone project.',
      type: 'guide', unitCode: 'SIT764',
      uploadedBy: alex._id, tags: ['capstone', 'guidelines'],
      downloadCount: 28, createdAt: d('2026-05-03')
    },
    {
      title: 'Machine Learning Algorithms Summary',
      description: 'Quick-reference cheat sheet for common ML algorithms with pros/cons.',
      type: 'notes', unitCode: 'SIT374',
      uploadedBy: james._id, tags: ['ML', 'algorithms'],
      downloadCount: 62, createdAt: d('2026-05-08')
    },
    {
      title: 'JavaScript Async/Await Patterns',
      description: 'Practical guide to async programming patterns in modern JavaScript.',
      type: 'notes', unitCode: 'SIT313',
      uploadedBy: priya._id, tags: ['JavaScript', 'async'],
      downloadCount: 19, createdAt: d('2026-05-09')
    },
    {
      title: 'Cloud Architecture Fundamentals',
      description: 'AWS and Azure patterns for scalable cloud system design.',
      type: 'guide', unitCode: 'SIT315',
      uploadedBy: emma._id, tags: ['cloud', 'AWS', 'Azure'],
      downloadCount: 25, createdAt: d('2026-05-06')
    },
    {
      title: 'SIT374 Data Structures Past Exam 2025',
      description: 'Full past exam with worked solutions — great for revision.',
      type: 'past-exam', unitCode: 'SIT374',
      uploadedBy: sarah._id, tags: ['exam', 'revision'],
      downloadCount: 89, createdAt: d('2026-05-04')
    },
    {
      title: 'Python for Data Science Cheat Sheet',
      description: 'Essential pandas, numpy, and matplotlib snippets for data work.',
      type: 'notes', unitCode: 'SIT374',
      uploadedBy: alex._id, tags: ['Python', 'pandas', 'data'],
      downloadCount: 43, createdAt: d('2026-05-09')
    }
  ]);

  // ── Events ──────────────────────────────────────────────────────────────────
  const events = await Event.insertMany([
    {
      title: 'Deakin Tech Networking Night',
      description: 'Connect with industry professionals and fellow students over canapés.',
      type: 'networking', organizer: 'Deakin IT Society',
      date: d('2026-05-15'), location: 'Geelong Waterfront Campus',
      tags: ['networking', 'industry'], unitCodes: ['SIT764'],
      registeredStudents: [alex._id, sarah._id, priya._id]
    },
    {
      title: 'Machine Learning Workshop',
      description: 'Hands-on session covering supervised learning and model evaluation.',
      type: 'workshop', organizer: 'Deakin AI Club',
      date: d('2026-05-12'), location: 'Online', isOnline: true,
      tags: ['Machine Learning', 'AI', 'Data Science'], unitCodes: ['SIT374'],
      registeredStudents: [alex._id, james._id, emma._id]
    },
    {
      title: 'Cloud Computing Seminar — SIT315',
      description: 'Guest lecture on modern cloud-native architecture patterns.',
      type: 'academic', organizer: 'School of IT',
      date: d('2026-05-20'), location: 'Melbourne Burwood Campus',
      tags: ['Cloud', 'AWS'], unitCodes: ['SIT315'],
      registeredStudents: [marcus._id, emma._id]
    },
    {
      title: 'Student Hackathon 2026',
      description: '48-hour hackathon open to all Deakin students. Build something amazing!',
      type: 'competition', organizer: 'Deakin Innovation Hub',
      date: d('2026-06-01'), location: 'Melbourne Burwood Campus',
      tags: ['hackathon', 'innovation'],
      registeredStudents: [priya._id, sarah._id]
    },
    {
      title: 'IT & Engineering Career Fair',
      description: 'Meet 40+ employers actively hiring graduates and interns.',
      type: 'career', organizer: 'Deakin Careers',
      date: d('2026-05-25'), location: 'Melbourne Burwood Campus',
      tags: ['careers', 'internship', 'graduate'],
      registeredStudents: [alex._id, sarah._id, marcus._id, priya._id]
    },
    {
      title: 'Python Study Group — SIT374',
      description: 'Weekly study group to work through SIT374 assignments together.',
      type: 'study', organizer: 'Student-led',
      date: d('2026-05-11'), location: 'Online', isOnline: true,
      tags: ['Python', 'Data Science'], unitCodes: ['SIT374'],
      registeredStudents: [alex._id, james._id, sarah._id]
    }
  ]);

  const mlWorkshop = events.find(e => e.title === 'Machine Learning Workshop');

  // ── Forum Posts ─────────────────────────────────────────────────────────────
  await ForumPost.insertMany([
    {
      title: 'Struggling with SIT374 project scope — any tips?',
      content: 'Our team keeps gold-plating features. How do you keep scope under control?',
      author: alex._id, unitCode: 'SIT374', tags: ['project', 'agile'],
      replies: 12, likes: 8, views: 94, createdAt: d('2026-05-06')
    },
    {
      title: 'Best resources for parallel computing (SIT315)?',
      content: 'Looking for good references beyond the lecture slides for OpenMP.',
      author: marcus._id, unitCode: 'SIT315', tags: ['parallel', 'OpenMP'],
      replies: 8, likes: 5, views: 61, createdAt: d('2026-05-07')
    },
    {
      title: 'Capstone team formation — looking for ML enthusiasts',
      content: 'Forming a SIT764 capstone team. Want to build an AI-powered study assistant.',
      author: emma._id, unitCode: 'SIT764', tags: ['capstone', 'Machine Learning', 'AI'],
      replies: 15, likes: 11, views: 132, createdAt: d('2026-05-05')
    },
    {
      title: 'Help with gradient descent implementation in Python',
      content: 'My loss curve keeps exploding after a few epochs. Learning rate issue?',
      author: james._id, unitCode: 'SIT374', tags: ['Python', 'Machine Learning'],
      replies: 6, likes: 9, views: 48, createdAt: d('2026-05-08')
    },
    {
      title: 'React vs Vue.js for the capstone project?',
      content: 'Weighing up the two for our SIT764 project. What would you choose and why?',
      author: priya._id, unitCode: 'SIT764', tags: ['React', 'Web Development'],
      replies: 20, likes: 14, views: 187, createdAt: d('2026-05-04')
    },
    {
      title: 'SIT315 Assignment 2 — task clarification thread',
      content: 'Posting the tutor\'s email clarification here so everyone has it.',
      author: sarah._id, unitCode: 'SIT315', tags: ['assignment'],
      replies: 11, likes: 7, views: 73, createdAt: d('2026-05-09')
    },
    {
      title: 'Internship opportunities for CS students at Deakin',
      content: 'Compiling a list of companies currently hiring Deakin CS interns.',
      author: alex._id, unitCode: null, tags: ['internship', 'careers'],
      replies: 9, likes: 16, views: 210, createdAt: d('2026-05-03')
    },
    {
      title: 'Scikit-learn vs TensorFlow — which to learn first?',
      content: 'If you\'re new to ML, should you start with sklearn or go straight to TF?',
      author: james._id, unitCode: 'SIT374', tags: ['Machine Learning', 'Python'],
      replies: 7, likes: 5, views: 55, createdAt: d('2026-05-07')
    }
  ]);

  // ── Notifications for Alex ───────────────────────────────────────────────────
  await Notification.insertMany([
    {
      studentId: alex._id, type: 'forum_reply', read: false,
      title: 'New reply on your post',
      message: 'Sarah Chen replied: "Try timeboxing each feature to 2 hours max..."',
      createdAt: d('2026-05-10T08:00:00')
    },
    {
      studentId: alex._id, type: 'connection_request', read: false,
      title: 'Connection request',
      message: 'Marcus Williams wants to connect with you!',
      createdAt: d('2026-05-10T05:00:00')
    },
    {
      studentId: alex._id, type: 'event', read: false,
      title: 'Event tomorrow',
      message: `Machine Learning Workshop starts tomorrow — don't forget to join!`,
      createdAt: d('2026-05-10T02:00:00')
    },
    {
      studentId: alex._id, type: 'resource', read: false,
      title: 'New resource for SIT374',
      message: 'James O\'Brien uploaded: "Machine Learning Algorithms Summary"',
      createdAt: d('2026-05-09T20:00:00')
    },
    {
      studentId: alex._id, type: 'forum_reply', read: false,
      title: 'Reply on gradient descent post',
      message: "James O'Brien replied: \"Check out scikit-learn's SGD first — much easier...\"",
      createdAt: d('2026-05-09T10:00:00')
    },
    {
      studentId: alex._id, type: 'forum_reply', read: true,
      title: 'Priya liked your post',
      message: 'Priya Sharma liked your internship opportunities post.',
      createdAt: d('2026-05-09T09:00:00')
    },
    {
      studentId: alex._id, type: 'event', read: true,
      title: 'Upcoming career fair',
      message: 'IT & Engineering Career Fair is in 15 days — registration is open!',
      createdAt: d('2026-05-08T12:00:00')
    },
    {
      studentId: alex._id, type: 'connection_request', read: true,
      title: 'Connection accepted',
      message: 'Emma Wilson accepted your connection request. You are now connected!',
      createdAt: d('2026-05-07T14:00:00')
    },
    {
      studentId: alex._id, type: 'forum_reply', read: true,
      title: 'Hot discussion in SIT764',
      message: 'New post: "React vs Vue.js for the capstone?" has 20 replies.',
      createdAt: d('2026-05-07T08:00:00')
    },
    {
      studentId: alex._id, type: 'resource', read: true,
      title: 'New SIT315 study materials',
      message: '2 new resources have been uploaded for your SIT315 unit.',
      createdAt: d('2026-05-06T16:00:00')
    }
  ]);

  console.log('✓ Students:      6');
  console.log('✓ Resources:     8');
  console.log('✓ Events:        6');
  console.log('✓ Forum posts:   8');
  console.log('✓ Notifications: 10');
  console.log('\nDashboard seed complete! Demo student: alex.johnson@deakin.edu.au');

  await mongoose.connection.close();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
