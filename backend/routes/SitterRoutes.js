const router = require('express').Router();
const multer = require('multer');
const auth = require('../middleware/auth');
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
router.post('/profile',   auth, upload.single('photo'), upsertProfile);
router.delete('/profile/:id', auth, deleteProfile);

module.exports = router;