require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');
const { User } = require('../models');

const demoUsers = [
  {
    email: 'darude@example.com',
    fullName: 'Darude Sandstorm',
    phone: '5123456',
    city: 'Tallinn',
    role: 'owner',
  },
  {
    email: 'toru@example.com',
    fullName: 'Toru Jüri',
    phone: '5654321',
    city: 'Tartu',
    role: 'sitter',
  },
];

async function seedUsers() {
  try {
    const seedPassword = process.env.DEMO_SEED_PASSWORD;
    if (!seedPassword || !String(seedPassword).trim()) {
      console.error(
        'Missing DEMO_SEED_PASSWORD. Set it in backend/.env before seeding demo users (never commit real passwords).',
      );
      process.exit(1);
    }

    console.log('🌱 Seeding demo users...\n');

    await sequelize.authenticate();

    for (const user of demoUsers) {
      const existing = await User.findOne({ where: { email: user.email } });

      if (!existing) {
        const passwordHash = await bcrypt.hash(seedPassword, 10);
        await User.create({
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          city: user.city,
          role: user.role,
          passwordHash,
        });
        console.log(`✓ Created: ${user.fullName} (${user.role})`);
      } else {
        console.log(`⊘ Skipped: ${user.email} (already exists)`);
      }
    }

    console.log('\n✓ Demo users seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding users:', error.message);
    process.exit(1);
  }
}

seedUsers();
