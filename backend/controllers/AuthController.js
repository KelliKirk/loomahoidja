const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

class AuthController {
  // Generate test token for development
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

  static async register(req, res) {
    try {
      const { email, fullName, phone, city, role, password } = req.body;

      if (!email || !fullName || !role || !password) {
        return res.status(400).json({ error: 'Missing required field(s)' });
      }

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'A user with this email already exists' });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await User.create({
        email,
        fullName,
        phone,
        city,
        role,
        passwordHash
      });
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role }
      });
    } catch (error) {
      res.status(500).json({ message: 'Registration failed: ', error: error.message });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid password' });
      }
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role }
      });
    } catch (error) {
      res.status(500).json({ message: 'Login failed: ', error: error.message });
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

  // Update user role (make them sitter/owner)
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
