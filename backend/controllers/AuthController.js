const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

class AuthController {
  static async register(req, res, next) {
    try {
      const { email, password, fullName, phone = null, city = null, role = 'owner' } = req.body;

      if (!email || !password || !fullName) {
        return res.status(400).json({ error: 'email, password, and fullName are required' });
      }

      if (!['owner', 'sitter'].includes(role)) {
        return res.status(400).json({ error: 'role must be "owner" or "sitter"' });
      }

      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({ error: 'User with this email already exists' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({ email, fullName, phone, city, role, passwordHash });

      const secret = process.env.JWT_SECRET;
      if (!secret) return res.status(500).json({ error: 'JWT_SECRET not configured in .env' });

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, secret, { expiresIn: '7d' });

      return res.status(201).json({
        message: 'Registered',
        user: { id: user.id, email: user.email, fullName: user.fullName, phone: user.phone, city: user.city, role: user.role },
        token,
      });
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'email and password are required' });
      }

      const user = await User.findOne({ where: { email } });
      if (!user) return res.status(401).json({ error: 'Invalid email or password' });

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return res.status(401).json({ error: 'Invalid email or password' });

      const secret = process.env.JWT_SECRET;
      if (!secret) return res.status(500).json({ error: 'JWT_SECRET not configured in .env' });

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, secret, { expiresIn: '7d' });

      return res.status(200).json({
        message: 'Logged in',
        user: { id: user.id, email: user.email, fullName: user.fullName, phone: user.phone, city: user.city, role: user.role },
        token,
      });
    } catch (err) {
      next(err);
    }
  }

  static generateTestToken(req, res) {
    try {
      const { userId = 1, email = 'test@example.com', role = 'owner' } = req.body;
      const secret = process.env.JWT_SECRET;

      if (!secret) {
        return res.status(500).json({ error: 'JWT_SECRET not configured in .env' });
      }

      const token = jwt.sign(
        { id: userId, email, role },
        secret,
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        message: 'Test token generated',
        token,
        user: { id: userId, email, role },
        expiresIn: '7 days',
        instructions: 'Copy the token and add to Postman: Authorization: Bearer {token}'
      });
    } catch (error) {
      console.error('Error generating token:', error);
      return res.status(500).json({ error: 'Failed to generate token' });
    }
  }

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
        decoded
      });
    } catch (error) {
      console.error('Token verification error:', error.message);
      return res.status(401).json({
        error: 'Invalid or expired token',
        details: error.message
      });
    }
  }

  static async updateRole(req, res) {
    try {
      const { userId, role } = req.body;

      if (!userId || !role) {
        return res.status(400).json({ error: 'userId and role are required' });
      }

      if (!['owner', 'sitter'].includes(role)) {
        return res.status(400).json({ error: 'Role must be "owner" or "sitter"' });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      await user.update({ role });

      return res.status(200).json({
        message: `User role updated to ${role}`,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Error updating role:', error);
      return res.status(500).json({ error: 'Failed to update role' });
    }
  }
}

module.exports = AuthController;
