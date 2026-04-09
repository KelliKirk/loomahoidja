require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');
const { User } = require('../models');

const demoUsers = [
  {
    email: 'owner@test.com',
    fullName: 'Mari Mets',
    phone: '5123456',
    city: 'Tallinn',
    role: 'owner',
    password: 'Test123!',
  },
  {
    email: 'sitter@test.com',
    fullName: 'Jaan Tamm',
    phone: '5654321',
    city: 'Tartu',
    role: 'sitter',
    password: 'Test123!',
  },
];

async function seedUsers() {
  try {
    console.log('🌱 Seeding demo users...\n');

    await sequelize.authenticate();

    for (const user of demoUsers) {
      const existing = await User.findOne({ where: { email: user.email } });

      if (!existing) {
        const passwordHash = await bcrypt.hash(user.password, 10);
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
