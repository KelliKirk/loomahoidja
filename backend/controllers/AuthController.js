const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const register = async (req, res) => {
    try {
        const { email, passwordHash, fullName, phone, city, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'A user with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(passwordHash, 10);

        const user = await User.create({
            email,
            passwordHash: hashedPassword,
            fullName,
            phone,
            city,
            role
        })
        res.status(201).json({ message: 'User registered successfully', userId: user.id });
    } catch (error) {
        res.status(500).json({ message: 'Registration failed: ', error: error.message });
    }
}

const login = async (req, res) => {
    try {
        const { email, passwordHash } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(passwordHash, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SERCRET,
            { expiresIn: '1h' }
        )

        res.json({ message: 'Login successful', token, user: { id: user.id, fullName: user.fullName, email: user.email } });
    } catch (error) {
        res.status(500).json({ message: 'Login failed: ', error: error.message });
    }
}

module.exports = {
    register,
    login
}