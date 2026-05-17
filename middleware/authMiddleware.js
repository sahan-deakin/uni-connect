const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'uniconnect-dev-secret';

/**
 * requireAuth
 * Verifies the Bearer token in the Authorization header.
 * On success, attaches the decoded payload to req.user and calls next().
 * On failure, responds 401 so the frontend can redirect to /login.html.
 */
function requireAuth(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { userId, studentId, email, role, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { requireAuth };
