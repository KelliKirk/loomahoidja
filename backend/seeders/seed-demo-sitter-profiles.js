require('dotenv').config();
const { sequelize } = require('../config/database');
const { User, SitterProfile } = require('../models');

const demoSitterProfiles = [
  {
    userEmail: 'toru@example.com',
    hourlyRate: 8.50,
    bio: 'I love animals. I have experience with both cats and dogs.',
    hasAnimals: false,
    hasChildren: true,
    city: 'Tartu',
  },
];

async function seedSitterProfiles() {
  try {
    console.log('🌱 Seeding demo sitter profiles...\n');

    await sequelize.authenticate();

    for (const profile of demoSitterProfiles) {
      const user = await User.findOne({ where: { email: profile.userEmail } });

      if (!user) {
        console.error(`✗ User not found: ${profile.userEmail}`);
        continue;
      }

      const existing = await SitterProfile.findOne({ where: { userId: user.id } });

      if (!existing) {
        await SitterProfile.create({
          userId: user.id,
          hourlyRate: profile.hourlyRate,
          bio: profile.bio,
          hasAnimals: profile.hasAnimals ? 1 : 0,
          hasChildren: profile.hasChildren ? 1 : 0,
          city: profile.city,
        });
        console.log(`✓ Created sitter profile for: ${user.fullName}`);
      } else {
        console.log(`⊘ Skipped: Sitter profile for ${user.fullName} (already exists)`);
      }
    }

    console.log('\n✓ Demo sitter profiles seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding sitter profiles:', error.message);
    process.exit(1);
  }
}

seedSitterProfiles();
