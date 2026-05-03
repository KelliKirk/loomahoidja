const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Message = sequelize.define(
  'Message',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    conversationId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    senderId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('text', 'image'),
      allowNull: false,
      defaultValue: 'text',
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'chat_messages',
    timestamps: true,
  }
);

module.exports = Message;

