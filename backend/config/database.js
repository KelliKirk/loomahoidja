const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_DATABASE || 'petsitting',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    dialectModule: require('mysql2'),
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const AnimalModel = require('../models/Animal');

const models = {
  Animal: AnimalModel(sequelize),
};

sequelize.authenticate()
  .then(() => {
    console.log('✓ Database connected successfully');
  })
  .catch(err => {
    console.error('✗ Database connection failed');
    console.error('  Error:', err.message);
    console.error('  Host:', process.env.DB_HOST);
    console.error('  Database:', process.env.DB_DATABASE);
  });

module.exports = {
  sequelize,
  models,
};
