const { sequelize } = require('../config/database');
const User = require('./User');
const SitterProfile = require('./SitterProfile');
const SitterAnimalType = require('./SitterAnimalType');
const Animal = require('./Animal')(sequelize);

// Set up relationships
User.hasOne(SitterProfile, { foreignKey: 'userId', onDelete: 'CASCADE' });
SitterProfile.belongsTo(User, { foreignKey: 'userId' });

SitterProfile.hasMany(SitterAnimalType, { foreignKey: 'sitterId', onDelete: 'CASCADE' });
SitterAnimalType.belongsTo(SitterProfile, { foreignKey: 'sitterId' });

User.hasMany(Animal, { foreignKey: 'ownerId', onDelete: 'CASCADE' });
Animal.belongsTo(User, { foreignKey: 'ownerId' });

module.exports = { User, SitterProfile, SitterAnimalType, Animal };