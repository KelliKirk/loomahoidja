const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MessageAttachment = sequelize.define(
  'MessageAttachment',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    messageId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    kind: {
      type: DataTypes.ENUM('image'),
      allowNull: false,
      defaultValue: 'image',
    },
    path: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    mime: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    size: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  },
  {
    tableName: 'chat_message_attachments',
    timestamps: true,
  }
);

module.exports = MessageAttachment;

