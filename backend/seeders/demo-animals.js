require('dotenv').config();
const { sequelize, models } = require('../config/database');

const demoAnimals = [
  {
    ownerId: 1,
    name: 'Max',
    animalType: 'dog',
    age: 3,
    goodWithAnimals: true,
    goodWithChildren: true,
    notes: 'Friendly golden retriever, loves to play fetch and swim.',
  },
  {
    ownerId: 1,
    name: 'Luna',
    animalType: 'cat',
    age: 2,
    goodWithAnimals: false,
    goodWithChildren: true,
    notes: 'Independent tabby cat, enjoys quiet environments.',
  },
  {
    ownerId: 1,
    name: 'Charlie',
    animalType: 'dog',
    age: 5,
    goodWithAnimals: true,
    goodWithChildren: false,
    notes: 'Energetic border collie, requires lots of exercise and mental stimulation.',
  },
  {
    ownerId: 1,
    name: 'Milo',
    animalType: 'bird',
    age: 1,
    goodWithAnimals: false,
    goodWithChildren: true,
    notes: 'Colorful parakeet, very vocal and social.',
  },
  {
    ownerId: 1,
    name: 'Buddy',
    animalType: 'dog',
    age: 7,
    goodWithAnimals: true,
    goodWithChildren: true,
    notes: 'Senior mixed breed, calm and gentle, perfect for families.',
  },
];

async function seedAnimals() {
  try {
    console.log('🌱 Seeding demo animals...\n');

    await sequelize.sync({ alter: false });

    for (const animal of demoAnimals) {
      const existing = await models.Animal.findOne({ where: { name: animal.name } });
      
      if (!existing) {
        await models.Animal.create(animal);
        console.log(`✓ Created: ${animal.name} (${animal.animalType})`);
      } else {
        console.log(`⊘ Skipped: ${animal.name} (already exists)`);
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
