require('dotenv').config();
const { sequelize } = require('../config/database');
const { User, SitterProfile, SitterAnimalType } = require('../models');

const animalTypesForSitters = [
  {
    userEmail: 'sitter@test.com',
    animalTypes: ['dog', 'cat', 'bird'],
  },
];

async function seedSitterAnimalTypes() {
  try {
    console.log('🌱 Seeding sitter animal types...\n');

    await sequelize.authenticate();

    for (const sitterData of animalTypesForSitters) {
      const user = await User.findOne({ where: { email: sitterData.userEmail } });

      if (!user) {
        console.error(`✗ User not found: ${sitterData.userEmail}`);
        continue;
      }

      const profile = await SitterProfile.findOne({ where: { userId: user.id } });

      if (!profile) {
        console.error(`✗ Sitter profile not found for: ${sitterData.userEmail}`);
        continue;
      }

      for (const animalType of sitterData.animalTypes) {
        const existing = await SitterAnimalType.findOne({
          where: { sitterId: profile.id, animalType },
        });

        if (!existing) {
          await SitterAnimalType.create({
            sitterId: profile.id,
            animalType,
          });
          console.log(`✓ Added ${animalType} to ${user.fullName}'s profile`);
        } else {
          console.log(`⊘ Skipped: ${animalType} already in ${user.fullName}'s profile`);
        }
      }
    }

    console.log('\n✓ Sitter animal types seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding sitter animal types:', error.message);
    process.exit(1);
  }
}

seedSitterAnimalTypes();
