const {
  validateCreateAnimalPayload,
  normalizeAnimalCreateData,
  normalizeAnimalUpdateData,
} = require('../../validation/animalValidation');

describe('animalValidation', () => {
  test('validateCreateAnimalPayload rejects missing name', () => {
    const res = validateCreateAnimalPayload({ animalType: 'dog' });
    expect(res.ok).toBe(false);
    expect(res.errors[0]).toBe('Name is required');
  });

  test('validateCreateAnimalPayload rejects negative age', () => {
    const res = validateCreateAnimalPayload({ name: 'Rex', age: -1 });
    expect(res.ok).toBe(false);
    expect(res.errors).toContain('Age must be a non-negative integer');
  });

  test('normalizeAnimalCreateData coerces booleans and photo path', () => {
    const data = normalizeAnimalCreateData({
      ownerId: 123,
      body: { name: 'Rex', goodWithAnimals: 'true', goodWithChildren: false, age: '5' },
      file: { filename: 'x.jpg' },
    });

    expect(data).toEqual(
      expect.objectContaining({
        ownerId: 123,
        name: 'Rex',
        age: 5,
        goodWithAnimals: true,
        goodWithChildren: false,
        photo: 'animals/x.jpg',
      })
    );
  });

  test('normalizeAnimalUpdateData only includes defined fields', () => {
    const update = normalizeAnimalUpdateData({ body: { notes: 'hi', age: '' }, file: null });
    expect(update).toEqual({ age: null, notes: 'hi' });
  });
});

