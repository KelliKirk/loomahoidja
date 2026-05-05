const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

 const Animal = sequelize.define('Animal', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    ownerId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    animalType: {
      type: DataTypes.ENUM('dog', 'cat', 'bird', 'rodent', 'other'),
      allowNull: true,
    },
    age: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    photo: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    goodWithAnimals: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    goodWithChildren: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'animals',
    timestamps: true,
    underscored: false,
  });

module.exports = Animal;