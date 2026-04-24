const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./config/database');
require('./models');

const errorHandler = require('./middleware/errorHandler');

const app = express();

// Set database in app for use in routes/controllers
app.set('sequelize', sequelize);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount all routes
app.use('/api/animals', require('./routes/AnimalRoutes'));
app.use('/api/auth', require('./routes/AuthRoutes'));
app.use('/api/sitters', require('./routes/SitterRoutes'));
app.use('/api/conversations', require('./routes/ConversationRoutes'));
app.use('/api/notifications', require('./routes/NotificationRoutes'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

// Error handling
app.use(errorHandler);

module.exports = app;