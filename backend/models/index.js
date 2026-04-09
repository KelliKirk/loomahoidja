const User = require('./User');
const SitterProfile = require('./SitterProfile');
const SitterAnimalType = require('./SitterAnimalType');

User.hasOne(SitterProfile, { foreignKey: 'userId', onDelete: 'CASCADE' });
SitterProfile.belongsTo(User, { foreignKey: 'userId' });

SitterProfile.hasMany(SitterAnimalType, { foreignKey: 'sitterId', onDelete: 'CASCADE' });
SitterAnimalType.belongsTo(SitterProfile, { foreignKey: 'sitterId' });

module.exports = { User, SitterProfile, SitterAnimalType };