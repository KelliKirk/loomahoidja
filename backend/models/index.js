const { sequelize, DataTypes } = require('../config/database');

const User = require('./User');
const SitterProfile = require('./SitterProfile');
const SitterAnimalType = require('./SitterAnimalType');
const Animal = require('./Animal'); 
const Conversation = require('./Conversation');
const ConversationParticipant = require('./ConversationParticipant');
const Message = require('./Message');
const MessageAttachment = require('./MessageAttachment');
const Notification = require('./Notification');
const BookingRequest = require('./BookingRequest');

User.hasOne(SitterProfile, { foreignKey: 'userId', onDelete: 'CASCADE' });
SitterProfile.belongsTo(User, { foreignKey: 'userId' });

SitterProfile.hasMany(SitterAnimalType, { foreignKey: 'sitterId', onDelete: 'CASCADE' });
SitterAnimalType.belongsTo(SitterProfile, { foreignKey: 'sitterId' });

User.hasMany(Animal, { foreignKey: 'ownerId', onDelete: 'CASCADE' });
Animal.belongsTo(User, { foreignKey: 'ownerId' });

Conversation.hasMany(Message, { foreignKey: 'conversationId', onDelete: 'CASCADE' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId' });

Message.hasMany(MessageAttachment, { foreignKey: 'messageId', onDelete: 'CASCADE' });
MessageAttachment.belongsTo(Message, { foreignKey: 'messageId' });

User.belongsToMany(Conversation, { through: ConversationParticipant, foreignKey: 'userId' });
Conversation.belongsToMany(User, { through: ConversationParticipant, foreignKey: 'conversationId' });

User.hasMany(Notification, { foreignKey: 'userId', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(BookingRequest, { foreignKey: 'ownerId', onDelete: 'CASCADE' });
BookingRequest.belongsTo(User, { foreignKey: 'ownerId', as: 'Owner' });

SitterProfile.hasMany(BookingRequest, { foreignKey: 'sitterProfileId', onDelete: 'CASCADE' });
BookingRequest.belongsTo(SitterProfile, { foreignKey: 'sitterProfileId', as: 'SitterProfile' });

Animal.hasMany(BookingRequest, { foreignKey: 'animalId', onDelete: 'CASCADE' });
BookingRequest.belongsTo(Animal, { foreignKey: 'animalId', as: 'Animal' });

module.exports = {
  sequelize,
  User,
  SitterProfile,
  SitterAnimalType,
  Animal,
  Conversation,
  ConversationParticipant,
  Message,
  MessageAttachment,
  Notification,
  BookingRequest,
};