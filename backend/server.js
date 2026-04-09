require('dotenv').config();
const app = require('./App');
const { sequelize } = require('./config/database');

// Sync models with database
sequelize.sync({ alter: false })
  .then(() => {
    console.log('✓ Models synced with database');
  })
  .catch(err => {
    console.error('✗ Error syncing models:', err.message);
  });

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT);

server.on('listening', () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ API available at http://localhost:${PORT}/api`);
  console.log(`✓ Health check: GET http://localhost:${PORT}/health`);
});

server.on('error', (err) => {
  console.error(`✗ Failed to start server on port ${PORT}`);
  console.error(`  Error: ${err.message}`);
  process.exit(1);
});

module.exports = app;
