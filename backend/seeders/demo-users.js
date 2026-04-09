'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface) => {
    const hash1 = await bcrypt.hash('Test123!', 10);
    const hash2 = await bcrypt.hash('Test123!', 10);

    await queryInterface.bulkInsert('users', [
      {
        email: 'owner@test.com',
        passwordHash: hash1,
        fullName: 'Mari Mets',
        phone: '5123456',
        city: 'Tallinn',
        role: 'owner',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'sitter@test.com',
        passwordHash: hash2,
        fullName: 'Jaan Tamm',
        phone: '5654321',
        city: 'Tartu',
        role: 'sitter',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('users', null, {});
  },
};