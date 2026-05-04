const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Conversation = sequelize.define(
  'Conversation',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    contextType: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    contextId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
  },
  {
    tableName: 'chat_conversations',
    timestamps: true,
    underscored: false,
  }
);

module.exports = Conversation;

