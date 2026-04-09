const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  phone: DataTypes.STRING(50),
  fullName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  city: DataTypes.STRING(100),
  role: {
    type: DataTypes.ENUM('owner', 'sitter'),
    allowNull: false,
  },
}, {
  tableName: 'users',
});

module.exports = User;