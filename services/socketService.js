// Hardcoded demo session - replace with real session management later
const HARDCODED_SESSION_ID = 'sess_demo_001';
const HARDCODED_USER_ID    = 'alex-johnson-demo';

let _io = null;

function init(io) {
  _io = io;
}

function emitToSession(sessionId, notification) {
  if (!_io) return;
  _io.to(sessionId).emit('new-notification', notification);
}

function notifyForum(event, data) {
  if (!_io) return;
  _io.to('forum-room').emit(event, data);
}

module.exports = {
  init,
  emitToSession,
  notifyForum,
  HARDCODED_SESSION_ID,
  HARDCODED_USER_ID
};