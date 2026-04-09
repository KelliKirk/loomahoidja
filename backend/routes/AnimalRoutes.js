const express = require('express');
const AnimalController = require('../controllers/AnimalController');
const uploadAnimal = require('../middleware/uploadAnimal');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.post('/', uploadAnimal.single('photo'), AnimalController.create);

router.get('/', AnimalController.readAll);

router.get('/:id', AnimalController.read);

router.put('/:id', uploadAnimal.single('photo'), AnimalController.update);

router.delete('/:id', AnimalController.delete);

module.exports = router;
