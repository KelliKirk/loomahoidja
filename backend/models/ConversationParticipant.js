const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ConversationParticipant = sequelize.define(
  'ConversationParticipant',
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
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
  },
  {
    tableName: 'chat_conversation_participants',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['conversationId', 'userId'],
      },
    ],
  }
);

module.exports = ConversationParticipant;

