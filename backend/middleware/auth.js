const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const secret = process.env.JWT_SECRET;

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    if (!secret) {
      console.error('JWT_SECRET not configured in .env');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = auth;
