const mongoose    = require('mongoose');
const { io: SocketClient } = require('socket.io-client');

//Hardcoded demo values
const HARDCODED_SESSION_ID = 'sess_demo_001';
const HARDCODED_USER_ID    = 'alex-johnson-demo';
const DEMO_EMAIL           = 'alex.johnson@deakin.edu.au';
// 

const MONGO_URI   = 'mongodb://127.0.0.1:27017/uni-connect';
const SERVER_URL  = `http://localhost:3000`;
const VALID_TYPES = ['message', 'forum_reply', 'connection_request', 'event', 'resource'];

const [,,type, title, ...rest] = process.argv;
const message = rest.join(' ');

if (!type || !title || !message) {
  console.error('Usage: node scripts/notifyCommand.js <type> "<title>" "<message>"');
  console.error('Valid types:', VALID_TYPES.join(', '));
  process.exit(1);
}

if (!VALID_TYPES.includes(type)) {
  console.error(`Invalid type "${type}". Valid: ${VALID_TYPES.join(', ')}`);
  process.exit(1);
}

async function main() {
  await mongoose.connect(MONGO_URI);

  const Student      = require('../models/studentModel');
  const Notification = require('../models/notificationModel');

  const student = await Student.findOne({ email: DEMO_EMAIL });
  if (!student) {
    console.error('Demo student not found. Run: npm run seed:dashboard');
    await mongoose.disconnect();
    process.exit(1);
  }

  const notif = await Notification.create({ studentId: student._id, type, title, message });
  console.log(`[notify] Saved to DB - [${type}] "${title}"`);

  await mongoose.disconnect();

  // Push real-time via the running server
  const socket = SocketClient(SERVER_URL, { timeout: 3000 });

  const done = (msg) => { console.log(msg); socket.disconnect(); process.exit(0); };

  socket.on('connect', () => {
    socket.emit('admin-notify', {
      sessionId: HARDCODED_SESSION_ID,
      notification: notif.toObject()
    });
    setTimeout(() => done(`[notify] Pushed to session "${HARDCODED_SESSION_ID}" (user: ${HARDCODED_USER_ID})`), 200);
  });

  socket.on('connect_error', () => {
    done('[notify] Server not reachable - notification saved to DB only (will appear on next page load)');
  });
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
