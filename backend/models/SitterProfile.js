const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SitterProfile = sequelize.define('SitterProfile', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    unique: true,
  },
  photo: DataTypes.STRING(500),
  hourlyRate: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false,
  },
  bio: DataTypes.TEXT,
  hasAnimals: {
    type: DataTypes.TINYINT(1),
    defaultValue: 0,
  },
  hasChildren: {
    type: DataTypes.TINYINT(1),
    defaultValue: 0,
  },
  city: DataTypes.STRING(100),
}, {
  tableName: 'sitter_profiles',
});

module.exports = SitterProfile;