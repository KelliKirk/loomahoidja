'use strict';

module.exports = {
  up: async (queryInterface) => {
    const profile = await queryInterface.sequelize.query(
      `SELECT sp.id FROM sitter_profiles sp
       INNER JOIN users u ON u.id = sp.userId
       WHERE u.email = 'sitter@test.com'`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    await queryInterface.bulkInsert('sitter_animal_types', [
      { sitterId: profile[0].id, animalType: 'dog' },
      { sitterId: profile[0].id, animalType: 'cat' },
      { sitterId: profile[0].id, animalType: 'bird' },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('sitter_animal_types', null, {});
  },
};