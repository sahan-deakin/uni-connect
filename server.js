const express = require('express');
const http    = require('http');
const path    = require('path');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const PORT      = process.env.PORT      || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/uni-connect';

// 1) Database
mongoose.connect(MONGO_URI);
mongoose.connection.on('connected', () => console.log('Connected to MongoDB'));
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err.message);
  process.exit(1);
});

// 2) App + HTTP server + Socket.io
const app    = express();
const server = http.createServer(app);
const io     = new Server(server);

const socketService = require('./services/socketService');
socketService.init(io);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 3) Socket.io events
io.on('connection', (socket) => {
  // Client joins its session room
  socket.on('join', (sessionId) => {
    socket.join(sessionId);
    console.log(`[socket] ${socket.id} joined room "${sessionId}"`);
  });

  // CLI notifyCommand relays through here
  socket.on('admin-notify', ({ sessionId, notification }) => {
    io.to(sessionId).emit('new-notification', notification);
  });

  // Forum page clients join a shared room to receive live post updates
  socket.on('join-forum', () => {
    socket.join('forum-room');
    console.log(`[socket] ${socket.id} joined forum-room`);
  });

  socket.on('disconnect', () => {
    console.log(`[socket] ${socket.id} disconnected`);
  });
});

// 4) Routes
const authRoute      = require('./routes/authRoute');
const sampleRoute    = require('./routes/sampleRoute');
const dashboardRoute = require('./routes/dashboardRoute');
const reviewRoute = require('./routes/reviewRoute');
const adminRoute  = require('./routes/adminRoute');
const eventRoute = require('./routes/eventRoute');
const resourceRoute = require('./routes/resourceRoute');
const forumRoute    = require('./routes/forumRoute');
const studentRoute  = require('./routes/studentRoute');

app.use('/api/auth',      authRoute);
app.use('/api/samples',   sampleRoute);
app.use('/api/dashboard', dashboardRoute);
app.use('/api/reviews', reviewRoute);
app.use('/api/admin',   adminRoute);
app.use('/api/events', eventRoute);
app.use('/api/resources', resourceRoute);
app.use('/api/forum',     forumRoute);
app.use('/uploads', express.static('uploads'));
app.use('/api/student',   studentRoute);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});
// Route for navbar partial
app.get('/partials/navbar.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/partials/navbar.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(400).json({ error: 'Invalid id format' });
  }
  res.status(500).json({ error: err.message || 'Server error' });
});

// 5) Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});