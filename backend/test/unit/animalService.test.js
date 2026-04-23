jest.mock('../../models', () => ({
  Animal: {
    create: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
  },
}));

const { Animal } = require('../../models');
const AnimalService = require('../../services/animalService');

describe('animalService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createAnimal calls Animal.create', async () => {
    Animal.create.mockResolvedValue({ id: 1 });
    const res = await AnimalService.createAnimal({ name: 'Rex' });
    expect(Animal.create).toHaveBeenCalledWith({ name: 'Rex' });
    expect(res).toEqual({ id: 1 });
  });

  test('listAnimalsByOwnerId filters by ownerId', async () => {
    Animal.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const res = await AnimalService.listAnimalsByOwnerId(9);
    expect(Animal.findAll).toHaveBeenCalledWith({ where: { ownerId: 9 } });
    expect(res).toHaveLength(2);
  });
});

