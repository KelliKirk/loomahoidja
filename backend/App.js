const fs = require('fs');
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
app.use('/api/users', require('./routes/UserRoutes'));
app.use('/api/conversations', require('./routes/ConversationRoutes'));
app.use('/api/notifications', require('./routes/NotificationRoutes'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

// Optional: serve Vite production build from same origin (set SERVE_SPA=1 after `npm run build` in frontend/loomahoidja)
const frontendDist = path.join(__dirname, '../frontend/loomahoidja/dist');
if (process.env.SERVE_SPA === '1' && fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Error handling
app.use(errorHandler);

module.exports = app;
