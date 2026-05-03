const fs = require('fs');
const path = require('path');
const AnimalService = require('../services/animalService');
const {
  validateCreateAnimalPayload,
  normalizeAnimalCreateData,
  normalizeAnimalUpdateData,
} = require('../validation/animalValidation');

class AnimalController {
  static async create(req, res) {
    try {
      const ownerId = req.user.id;

      const validation = validateCreateAnimalPayload(req.body);
      if (!validation.ok) {
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ error: validation.errors[0] });
      }

      const data = normalizeAnimalCreateData({ ownerId, body: req.body, file: req.file });
      const animal = await AnimalService.createAnimal(data);

      return res.status(201).json({
        message: 'Pet created successfully',
        animal,
      });
    } catch (error) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      console.error('Error creating animal:', error);
      return res.status(500).json({ error: 'Failed to create pet' });
    }
  }

  static async read(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const animal = await AnimalService.getAnimalById(id);

      if (!animal) {
        return res.status(404).json({ error: 'Pet not found' });
      }

      if (animal.ownerId !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      return res.status(200).json(animal);
    } catch (error) {
      console.error('Error reading animal:', error);
      return res.status(500).json({ error: 'Failed to fetch pet' });
    }
  }

  static async readAll(req, res) {
    try {
      const userId = req.user.id;

      const animals = await AnimalService.listAnimalsByOwnerId(userId);

      return res.status(200).json({
        count: animals.length,
        animals,
      });
    } catch (error) {
      console.error('Error reading all animals:', error);
      return res.status(500).json({ error: 'Failed to fetch pets' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const animal = await AnimalService.getAnimalById(id);

      if (!animal) {
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({ error: 'Pet not found' });
      }

      if (animal.ownerId !== userId) {
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(403).json({ error: 'Unauthorized' });
      }

      if (req.file && animal.photo) {
        const oldPhotoPath = path.join(__dirname, '../uploads', animal.photo);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }

      const updateData = normalizeAnimalUpdateData({ body: req.body, file: req.file });
      await AnimalService.updateAnimal(animal, updateData);

      return res.status(200).json({
        message: 'Pet updated successfully',
        animal,
      });
    } catch (error) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      console.error('Error updating animal:', error);
      return res.status(500).json({ error: 'Failed to update pet' });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const animal = await AnimalService.getAnimalById(id);

      if (!animal) {
        return res.status(404).json({ error: 'Pet not found' });
      }

      if (animal.ownerId !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      if (animal.photo) {
        const photoPath = path.join(__dirname, '../uploads', animal.photo);
        if (fs.existsSync(photoPath)) {
          fs.unlinkSync(photoPath);
        }
      }

      await AnimalService.deleteAnimal(animal);

      return res.status(200).json({
        message: 'Pet deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting animal:', error);
      return res.status(500).json({ error: 'Failed to delete pet' });
    }
  }
}

module.exports = AnimalController;
