const jwt = require('jsonwebtoken');

class AuthController {
  // Generate test token for development
  static generateTestToken(req, res) {
    try {
      const { userId = 1, email = 'test@example.com' } = req.body;
      const secret = process.env.JWT_SECRET;

      if (!secret) {
        return res.status(500).json({ error: 'JWT_SECRET not configured in .env' });
      }

      const token = jwt.sign(
        { id: userId, email },
        secret,
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        message: 'Test token generated',
        token,
        user: { id: userId, email },
        expiresIn: '7 days',
        instructions: 'Copy the token and add to Postman: Authorization: Bearer {token}',
        debug: {
          secret_length: secret.length,
          token_created_with_secret: true
        }
      });
    } catch (error) {
      console.error('Error generating token:', error);
      return res.status(500).json({ error: 'Failed to generate token' });
    }
  }

  // Verify token endpoint (debug)
  static verifyToken(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const secret = process.env.JWT_SECRET;

      if (!token) {
        return res.status(400).json({ error: 'No token provided' });
      }

      if (!secret) {
        return res.status(500).json({ error: 'JWT_SECRET not configured' });
      }

      const decoded = jwt.verify(token, secret);
      return res.status(200).json({
        message: 'Token is valid',
        decoded,
        debug: {
          secret_length: secret.length,
          token_verified: true
        }
      });
    } catch (error) {
      console.error('Token verification error:', error.message);
      return res.status(401).json({
        error: 'Invalid or expired token',
        details: error.message
      });
    }
  }
}

module.exports = AuthController;
