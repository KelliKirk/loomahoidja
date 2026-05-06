function validateCreateAnimalPayload(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object') {
    return { ok: false, errors: ['Invalid payload'] };
  }

  if (!payload.name || String(payload.name).trim().length === 0) {
    errors.push('Name is required');
  }

  if (payload.age !== undefined && payload.age !== null && payload.age !== '') {
    const n = Number(payload.age);
    if (!Number.isInteger(n) || n < 0) {
      errors.push('Age must be a non-negative integer');
    }
  }

  return { ok: errors.length === 0, errors };
}

function normalizeAnimalCreateData({ ownerId, body, file }) {
  const { name, animalType, age, goodWithAnimals, goodWithChildren, notes } = body || {};
  
  const toBool = (val) =>
    val === true || val === 1 || val === '1' || val === 'true';
  
  return {
      ownerId,
      name,
      animalType: animalType || null,
      age: age !== undefined && age !== null && age !== '' ? parseInt(age, 10) : null,
      photo: file ? `animals/${file.filename}` : null,
      goodWithAnimals: toBool(goodWithAnimals),
      goodWithChildren: toBool(goodWithChildren),
      notes: notes || null,
    };
}

function normalizeAnimalUpdateData({ body, file }) {
  const { name, animalType, age, goodWithAnimals, goodWithChildren, notes } = body || {};
  const updateData = {};
  if (name) updateData.name = name;
  if (animalType) updateData.animalType = animalType;
  if (age !== undefined) updateData.age = age ? parseInt(age, 10) : null;
  if (goodWithAnimals !== undefined) updateData.goodWithAnimals = goodWithAnimals === 'true' || goodWithAnimals === true;
  if (goodWithChildren !== undefined) updateData.goodWithChildren = goodWithChildren === 'true' || goodWithChildren === true;
  if (notes !== undefined) updateData.notes = notes;
  if (file) updateData.photo = `animals/${file.filename}`;
  return updateData;
}

module.exports = {
  validateCreateAnimalPayload,
  normalizeAnimalCreateData,
  normalizeAnimalUpdateData,
};

