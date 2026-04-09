require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const { sequelize, models } = require('./config/database');
app.set('db', { sequelize, models });

sequelize.sync({ alter: false })
  .then(() => {
    console.log('✓ Models synced with database');
  })
  .catch(err => {
    console.error('✗ Error syncing models:', err.message);
  });

const routes = require('./routes');

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

app.use(routes);

app.use((error, req, res, next) => {
  console.error('Error:', error.message);

  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Max 5MB' });
  }
  if (error.message && error.message.includes('Invalid file type')) {
    return res.status(400).json({ error: error.message });
  }
  if (error.name === 'SequelizeError' || error.name === 'SequelizeDatabaseError') {
    return res.status(500).json({ error: 'Database error: ' + error.message });
  }

  res.status(500).json({ error: 'Internal server error' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Animals API available at http://localhost:${PORT}/animals`);
});

module.exports = app;
