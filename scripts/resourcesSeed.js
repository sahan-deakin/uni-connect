const mongoose = require('mongoose');
const resourceModel = require('../models/resourceModel');

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/uni-connect';

const RESOURCES = [
  {
    title: 'Data Structures & Algorithms — Complete Notes',
    unit: 'SIT221',
    type: 'Notes',
    desc: 'Comprehensive week-by-week notes covering arrays, linked lists, trees, graphs, sorting, and complexity analysis. Includes diagrams for every data structure.',
    tags: ['week1-6', 'sorting', 'graphs'],
    upvotes: 48,
    score: 92,
    institution: 'Deakin',
    uploader: 'Alex M.'
  },
  {
    title: 'OOP Final Exam 2023 with Worked Solutions',
    unit: 'SIT232',
    type: 'Past Exam',
    desc: 'Full past exam paper with complete model answers. Covers inheritance, polymorphism, interfaces, and design patterns. Great for exam revision.',
    tags: ['oop', 'inheritance', 'exam-prep'],
    upvotes: 39,
    score: 87,
    institution: 'Deakin',
    uploader: 'Jamie T.'
  },
  {
    title: 'Computer Networks Cheat Sheet',
    unit: 'SIT202',
    type: 'Notes',
    desc: 'One-page summary of OSI model, TCP/IP stack, subnetting, routing protocols, and common port numbers. Print-ready A4 format.',
    tags: ['osi', 'tcp-ip', 'subnetting'],
    upvotes: 31,
    score: 84,
    institution: 'Monash',
    uploader: 'Sam K.'
  },
  {
    title: 'Machine Learning Lecture Slides — All Weeks',
    unit: 'SIT374',
    type: 'Slides',
    desc: 'Full set of 12 weeks of ML lecture slides covering supervised, unsupervised, and reinforcement learning.',
    tags: ['ml', 'python', 'neural-nets'],
    upvotes: 27,
    score: 80,
    institution: 'Deakin',
    uploader: 'Priya S.'
  },
  {
    title: 'Cybersecurity Fundamentals — Study Guide',
    unit: 'SIT715',
    type: 'Notes',
    desc: 'Detailed study guide covering cryptography, network security, threat modelling, vulnerability assessment, and incident response frameworks.',
    tags: ['crypto', 'owasp', 'threats'],
    upvotes: 22,
    score: 76,
    institution: 'RMIT',
    uploader: 'Chris L.'
  },
  {
    title: 'Database Systems — ER Diagrams & SQL Notes',
    unit: 'SIT225',
    type: 'Notes',
    desc: 'Full notes on relational modelling, ER diagram notation, normalisation, and SQL query optimisation.',
    tags: ['sql', 'normalisation', 'er-diagrams'],
    upvotes: 19,
    score: 74,
    institution: 'Melbourne',
    uploader: 'Dana W.'
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);

    console.log('Connected to MongoDB');

    await resourceModel.deleteMany({});

    const resources = await resourceModel.insertMany(RESOURCES);

    console.log(`Seeded ${resources.length} resources`);

    await mongoose.connection.close();

    console.log('Database connection closed');
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});