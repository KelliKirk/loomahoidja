const router = require('express').Router();
const multer = require('multer');
const {
  getAll,
  getOne,
  upsertProfile,
  deleteProfile,
} = require('../controllers/SitterController');

const storage = multer.diskStorage({
  destination: 'uploads/profiles/',
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

router.get('/',           getAll);
router.get('/:id',        getOne);
router.post('/profile',   upload.single('photo'), upsertProfile);
router.delete('/profile/:id', deleteProfile);

module.exports = router;