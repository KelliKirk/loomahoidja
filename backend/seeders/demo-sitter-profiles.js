'use strict';

module.exports = {
  up: async (queryInterface) => {
    const sitter = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'sitter@test.com'`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    await queryInterface.bulkInsert('sitter_profiles', [
      {
        userId: sitter[0].id,
        hourlyRate: 8.50,
        bio: 'I love animals. I have experience with both cats and dogs.',
        hasAnimals: 0,
        hasChildren: 1,
        city: 'Tartu',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('sitter_profiles', null, {});
  },
};