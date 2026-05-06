require('dotenv').config();
const { DataTypes } = require('sequelize');
const app = require('./App');
const { sequelize } = require('./config/database');

sequelize
  .authenticate()
  .then(() => {
    console.log('✓ Database connected successfully');
    return sequelize.sync({ alter: false });
  })
  .then(async () => {
    const qi = sequelize.getQueryInterface();
    try {
      const desc = await qi.describeTable('users');
      if (desc && !desc.photo) {
        await qi.addColumn('users', 'photo', {
          type: DataTypes.STRING(255),
          allowNull: true,
        });
        console.log('✓ Added users.photo column');
      }
    } catch (e) {
      console.warn('Could not ensure users.photo column:', e.message);
    }
    console.log('✓ Models synced with database');
  })
  .catch((err) => {
    console.error('✗ Database init failed:', err.message);
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
