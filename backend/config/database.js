const { Sequelize } = require('sequelize');
require('dotenv').config();

const isTest = process.env.NODE_ENV === 'test';
const databaseName =
  (isTest ? process.env.DB_TEST_DATABASE : null) ||
  process.env.DB_DATABASE ||
  'petsitting';

const useSsl =
  process.env.DB_SSL === '1' ||
  process.env.DB_SSL === 'true' ||
  process.env.DB_SSL === 'yes';

const dialectOptions = {};
if (useSsl) {
  dialectOptions.ssl =
    process.env.DB_SSL_REJECT_UNAUTHORIZED === '0'
      ? { rejectUnauthorized: false }
      : { rejectUnauthorized: true };
}

const sequelize = new Sequelize(
  databaseName,
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    dialectModule: require('mysql2'),
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    ...(Object.keys(dialectOptions).length ? { dialectOptions } : {}),
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

module.exports = {
  sequelize,
};
