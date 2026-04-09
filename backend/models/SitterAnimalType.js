const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SitterAnimalType = sequelize.define('SitterAnimalType', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  sitterId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  animalType: {
    type: DataTypes.ENUM('dog', 'cat', 'bird', 'fish', 'rodents', 'other'),
    allowNull: false,
  },
}, {
  tableName: 'sitter_animal_types',
  timestamps: false,
});

module.exports = SitterAnimalType;