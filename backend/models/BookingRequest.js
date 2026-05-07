const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BookingRequest = sequelize.define(
  'BookingRequest',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    ownerId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    sitterProfileId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    animalId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'declined'),
      allowNull: false,
      defaultValue: 'pending',
    },
    respondedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'booking_requests',
    timestamps: true,
  },
);

module.exports = BookingRequest;

