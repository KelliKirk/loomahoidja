const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

class UserController {
  static async create(req, res, next) {
    try {
      const {
        email,
        fullName,
        phone = null,
        city = null,
        role,
        password,
      } = req.body;

      if (!email || !fullName || !role) {
        return res.status(400).json({ error: 'email, fullName, and role are required' });
      }

      if (!['owner', 'sitter'].includes(role)) {
        return res.status(400).json({ error: 'role must be "owner" or "sitter"' });
      }

      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({ error: 'User with this email already exists' });
      }

      const passwordHash = await bcrypt.hash(password || 'Test123!', 10);

      const user = await User.create({
        email,
        fullName,
        phone,
        city,
        role,
        passwordHash,
      });

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        return res.status(500).json({ error: 'JWT_SECRET not configured in .env' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        secret,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        message: 'User created',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          city: user.city,
          role: user.role,
        },
        token,
      });
    } catch (err) {
      next(err);
    }
  }

  static async list(req, res, next) {
    try {
      const users = await User.findAll({
        attributes: ['id', 'email', 'fullName', 'phone', 'city', 'role', 'createdAt'],
        order: [['id', 'DESC']],
      });
      res.json({ count: users.length, users });
    } catch (err) {
      next(err);
    }
  }

  static async getOne(req, res, next) {
    try {
      const user = await User.findByPk(req.params.id, {
        attributes: ['id', 'email', 'fullName', 'phone', 'city', 'role', 'createdAt'],
      });
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = UserController;
