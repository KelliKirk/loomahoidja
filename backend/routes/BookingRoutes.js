const express = require('express');
const auth = require('../middleware/auth');
const BookingController = require('../controllers/BookingController');

const router = express.Router();

// Public: used for disabling days in sitter profile calendar
router.get('/unavailable/:sitterProfileId', BookingController.unavailable);

// Authenticated
router.use(auth);
router.post('/requests', BookingController.createRequest);
router.get('/requests/me', BookingController.listMyRequests);
router.get('/requests/owner', BookingController.listOwnerRequests);
router.post('/requests/:id/respond', BookingController.respond);

module.exports = router;

