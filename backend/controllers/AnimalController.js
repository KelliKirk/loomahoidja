const fs = require('fs');
const path = require('path');
const { Animal } = require('../models');

class AnimalController {
  static async create(req, res) {
    try {
      const { name, animalType, age, goodWithAnimals, goodWithChildren, notes } = req.body;
      const ownerId = req.user.id;

      if (!name) {
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ error: 'Name is required' });
      }

      const photoPath = req.file ? `animals/${req.file.filename}` : null;

      const animal = await Animal.create({
        ownerId,
        name,
        animalType: animalType || null,
        age: age ? parseInt(age) : null,
        photo: photoPath,
        goodWithAnimals: goodWithAnimals === 'true' || goodWithAnimals === true,
        goodWithChildren: goodWithChildren === 'true' || goodWithChildren === true,
        notes: notes || null,
      });

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

      const animal = await Animal.findByPk(id);

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

      const animals = await Animal.findAll({
        where: { ownerId: userId },
      });

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
      const { name, animalType, age, goodWithAnimals, goodWithChildren, notes } = req.body;

      const animal = await Animal.findByPk(id);

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

      const updateData = {};
      if (name) updateData.name = name;
      if (animalType) updateData.animalType = animalType;
      if (age !== undefined) updateData.age = age ? parseInt(age) : null;
      if (goodWithAnimals !== undefined) updateData.goodWithAnimals = goodWithAnimals === 'true' || goodWithAnimals === true;
      if (goodWithChildren !== undefined) updateData.goodWithChildren = goodWithChildren === 'true' || goodWithChildren === true;
      if (notes !== undefined) updateData.notes = notes;
      if (req.file) updateData.photo = `animals/${req.file.filename}`;

      await animal.update(updateData);

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

      const animal = await Animal.findByPk(id);

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

      await animal.destroy();

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
