const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/uni-connect';

// 1) Database
mongoose.connect(MONGO_URI);

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err.message);
  process.exit(1);
});

// 2) App + middleware
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 3) Routes
const sampleRoute = require('./routes/sampleRoute');

app.use('/resources', require('./routes/resourceRoute'));

app.use('/api/samples', sampleRoute);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// 4) Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
