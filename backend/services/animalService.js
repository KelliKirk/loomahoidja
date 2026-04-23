const { Animal } = require('../models');

async function createAnimal(data) {
  return Animal.create(data);
}

async function getAnimalById(id) {
  return Animal.findByPk(id);
}

async function listAnimalsByOwnerId(ownerId) {
  return Animal.findAll({ where: { ownerId } });
}

async function updateAnimal(animal, updateData) {
  await animal.update(updateData);
  return animal;
}

async function deleteAnimal(animal) {
  await animal.destroy();
}

module.exports = {
  createAnimal,
  getAnimalById,
  listAnimalsByOwnerId,
  updateAnimal,
  deleteAnimal,
};

