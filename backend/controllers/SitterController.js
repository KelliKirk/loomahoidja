const { SitterProfile, SitterAnimalType, User } = require('../models');

// GET /api/sitters
exports.getAll = async (req, res, next) => {
  try {
    const sitters = await SitterProfile.findAll({
      include: [
        { model: User, attributes: ['fullName', 'city'] },
        { model: SitterAnimalType, attributes: ['animalType'] },
      ],
    });
    res.json(sitters);
  } catch (err) {
    next(err);
  }
};

// GET /api/sitters/:id
exports.getOne = async (req, res, next) => {
  try {
    const sitter = await SitterProfile.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ['fullName', 'city'] },
        { model: SitterAnimalType, attributes: ['animalType'] },
      ],
    });
    if (!sitter) return res.status(404).json({ error: 'Sitter not found' });
    res.json(sitter);
  } catch (err) {
    next(err);
  }
};

// POST /api/sitters/profile
exports.upsertProfile = async (req, res, next) => {
  try {
    const { userId, hourlyRate, bio, hasAnimals, hasChildren, city } = req.body;
    let { animalTypes } = req.body;
    if (typeof animalTypes === 'string') {
      try {
        const parsed = JSON.parse(animalTypes);
        animalTypes = parsed;
      } catch {
        animalTypes = animalTypes
          .split(',')
          .map((x) => String(x).trim())
          .filter(Boolean);
      }
    }

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role !== 'sitter') return res.status(403).json({ error: 'Only sitters can create a profile' });

    const photo = req.file ? req.file.filename : null;

    let profile = await SitterProfile.findOne({ where: { userId } });

    if (profile) {
      await profile.update({
        hourlyRate, bio, hasAnimals, hasChildren, city,
        ...(photo && { photo }),
      });
    } else {
      profile = await SitterProfile.create({
        userId, hourlyRate, bio, hasAnimals, hasChildren, city, photo,
      });
    }

    if (Array.isArray(animalTypes)) {
      await SitterAnimalType.destroy({ where: { sitterId: profile.id } });
      await SitterAnimalType.bulkCreate(
        animalTypes.map((type) => ({ sitterId: profile.id, animalType: type }))
      );
    }

    const result = await SitterProfile.findByPk(profile.id, {
      include: [
        { model: User, attributes: ['fullName', 'city'] },
        { model: SitterAnimalType, attributes: ['animalType'] },
      ],
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/sitters/profile/:id
exports.deleteProfile = async (req, res, next) => {
  try {
    const profile = await SitterProfile.findByPk(req.params.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    await profile.destroy();
    res.json({ message: 'Profile has been deleted' });
  } catch (err) {
    next(err);
  }
};