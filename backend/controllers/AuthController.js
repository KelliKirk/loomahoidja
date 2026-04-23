const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

class AuthController {

    static async register(req, res, next) {
        try {
            const { email, fullName, phone, city, role, password } = req.body;

            // Check required fields
            if (!email || !fullName || !role || !password) {
                return res.status(400).json({ error: 'Missing required field(s)' });
            }

            // Check if user already exists
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
            })
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
            res.status(201).json({ message: 'User registered successfully', token, user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role } });
        } catch (error) {
            res.status(500).json({ message: 'Registration failed: ', error: error.message });
        }
    }

    static async login(req, res, next) {
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
            )

            res.json({ message: 'Login successful', token, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } });
        } catch (error) {
            res.status(500).json({ message: 'Login failed: ', error: error.message });
        }
    }
}


module.exports = AuthController;

