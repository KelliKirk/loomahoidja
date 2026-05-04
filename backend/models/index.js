const { sequelize, DataTypes } = require('../config/database');

const UserModel  = require('./User');
const SitterProfile = require('./SitterProfile');
const SitterAnimalType = require('./SitterAnimalType');
const AnimalModel = require('./Animal');

const User = UserModel(sequelize);
const SitterProfile = SitterProfileModel(sequelize);
const SitterAnimalType = SitterAnimalTypeModel(sequelize);
const Animal = AnimalModel(sequelize);
// Set up relationships
User.hasOne(SitterProfile, { foreignKey: 'userId', onDelete: 'CASCADE' });
SitterProfile.belongsTo(User, { foreignKey: 'userId' });

SitterProfile.hasMany(SitterAnimalType, { foreignKey: 'sitterId', onDelete: 'CASCADE' });
SitterAnimalType.belongsTo(SitterProfile, { foreignKey: 'sitterId' });

User.hasMany(Animal, { foreignKey: 'ownerId', onDelete: 'CASCADE' });
Animal.belongsTo(User, { foreignKey: 'ownerId' });

module.exports = { User, SitterProfile, SitterAnimalType, Animal };