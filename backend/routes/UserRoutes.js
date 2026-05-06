const express = require('express');
const multer = require('multer');
const UserController = require('../controllers/UserController');
const auth = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: 'uploads/profiles/',
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ok = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.mimetype);
    cb(ok ? null : new Error('Invalid file type'), ok);
  },
});

router.post('/me/photo', auth, upload.single('photo'), UserController.uploadMyPhoto);
router.patch('/me', auth, UserController.updateMe);
router.post('/', UserController.create);
router.get('/', UserController.list);
router.get('/:id', UserController.getOne);

module.exports = router;

