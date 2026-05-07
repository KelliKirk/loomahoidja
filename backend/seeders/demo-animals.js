require('dotenv').config();
const { sequelize } = require('../config/database');
const { Animal, User } = require('../models');

const demoAnimalsData = [
  {
    userEmail: 'darude@example.com',
    animals: [
      {
        name: 'Max',
        animalType: 'dog',
        age: 3,
        goodWithAnimals: true,
        goodWithChildren: true,
        notes: 'Friendly golden retriever, loves to play fetch and swim.',
      },
      {
        name: 'Luna',
        animalType: 'cat',
        age: 2,
        goodWithAnimals: false,
        goodWithChildren: true,
        notes: 'Independent tabby cat, enjoys quiet environments.',
      },
      {
        name: 'Charlie',
        animalType: 'dog',
        age: 5,
        goodWithAnimals: true,
        goodWithChildren: false,
        notes: 'Energetic border collie, requires lots of exercise and mental stimulation.',
      },
      {
        name: 'Milo',
        animalType: 'bird',
        age: 1,
        goodWithAnimals: false,
        goodWithChildren: true,
        notes: 'Colorful parakeet, very vocal and social.',
      },
      {
        name: 'Buddy',
        animalType: 'dog',
        age: 7,
        goodWithAnimals: true,
        goodWithChildren: true,
        notes: 'Senior mixed breed, calm and gentle, perfect for families.',
      },
    ],
  },
];

async function seedAnimals() {
  try {
    console.log('🌱 Seeding demo animals...\n');

    await sequelize.authenticate();

    for (const ownerData of demoAnimalsData) {
      const owner = await User.findOne({ where: { email: ownerData.userEmail } });

      if (!owner) {
        console.error(`✗ Owner not found: ${ownerData.userEmail}`);
        continue;
      }

      for (const animal of ownerData.animals) {
        const existing = await Animal.findOne({ where: { ownerId: owner.id, name: animal.name } });
        
        if (!existing) {
          await Animal.create({
            ownerId: owner.id,
            ...animal,
          });
          console.log(`✓ Created: ${animal.name} (${animal.animalType}) for ${owner.fullName}`);
        } else {
          console.log(`⊘ Skipped: ${animal.name} (already exists)`);
        }
      }
    }

    console.log('\n✓ Demo data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding data:', error.message);
    process.exit(1);
  }
}

seedAnimals();
