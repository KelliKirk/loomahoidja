const { Op } = require('sequelize');
const { BookingRequest, Notification, SitterProfile, User, Animal } = require('../models');

function toDateOnly(x) {
  // Accept Date, ISO string, or YYYY-MM-DD; persist as YYYY-MM-DD.
  const s = String(x || '').trim();
  if (!s) return null;
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

class BookingController {
  // POST /api/bookings/requests (owner)
  static async createRequest(req, res, next) {
    try {
      const ownerId = req.user.id;
      const { sitterProfileId, animalId, startDate, endDate } = req.body || {};

      const start = toDateOnly(startDate);
      const end = toDateOnly(endDate);
      if (!sitterProfileId || !animalId || !start || !end) {
        return res.status(400).json({ error: 'sitterProfileId, animalId, startDate, endDate are required' });
      }

      const sitterProfile = await SitterProfile.findByPk(sitterProfileId);
      if (!sitterProfile) return res.status(404).json({ error: 'Sitter not found' });

      const animal = await Animal.findByPk(animalId);
      if (!animal) return res.status(404).json({ error: 'Pet not found' });
      if (animal.ownerId !== ownerId) return res.status(403).json({ error: 'Unauthorized' });

      // Prevent overlapping accepted bookings
      const overlapAccepted = await BookingRequest.findOne({
        where: {
          sitterProfileId,
          status: 'accepted',
          startDate: { [Op.lte]: end },
          endDate: { [Op.gte]: start },
        },
      });
      if (overlapAccepted) {
        return res.status(409).json({ error: 'These dates are not available' });
      }

      const row = await BookingRequest.create({
        ownerId,
        sitterProfileId,
        animalId,
        startDate: start,
        endDate: end,
        status: 'pending',
      });

      const owner = await User.findByPk(ownerId, { attributes: ['id', 'fullName', 'email'] });
      const payload = JSON.stringify({
        bookingRequestId: row.id,
        ownerName: owner?.fullName || owner?.email || 'Owner',
        petName: animal.name || 'Pet',
        startDate: start,
        endDate: end,
      });

      await Notification.create({
        userId: sitterProfile.userId,
        type: 'booking_request',
        entityType: 'booking_request',
        entityId: row.id,
        payload,
        readAt: null,
      });

      return res.status(201).json({ bookingRequest: row });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/bookings/requests/me (sitter)
  static async listMyRequests(req, res, next) {
    try {
      const userId = req.user.id;
      const status = String(req.query.status || 'pending');
      const myProfile = await SitterProfile.findOne({ where: { userId } });
      if (!myProfile) return res.status(200).json({ count: 0, requests: [] });

      const where = { sitterProfileId: myProfile.id };
      if (['pending', 'accepted', 'declined'].includes(status)) where.status = status;

      const rows = await BookingRequest.findAll({
        where,
        order: [['id', 'DESC']],
        include: [
          { model: User, as: 'Owner', attributes: ['id', 'fullName', 'email', 'city'] },
          { model: Animal, as: 'Animal', attributes: ['id', 'name', 'animalType'] },
        ],
        limit: 200,
      });

      return res.status(200).json({ count: rows.length, requests: rows });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/bookings/requests/owner (owner)
  static async listOwnerRequests(req, res, next) {
    try {
      const ownerId = req.user.id;
      const status = String(req.query.status || '');
      const where = { ownerId };
      if (['pending', 'accepted', 'declined'].includes(status)) where.status = status;

      const rows = await BookingRequest.findAll({
        where,
        order: [['id', 'DESC']],
        include: [
          {
            model: SitterProfile,
            as: 'SitterProfile',
            include: [{ model: User, attributes: ['id', 'fullName', 'email', 'city'] }],
          },
          { model: Animal, as: 'Animal', attributes: ['id', 'name', 'animalType'] },
        ],
        limit: 200,
      });

      return res.status(200).json({ count: rows.length, requests: rows });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/bookings/requests/:id/respond (sitter)
  static async respond(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { status } = req.body || {};
      if (!['accepted', 'declined'].includes(status)) {
        return res.status(400).json({ error: 'status must be accepted or declined' });
      }

      const myProfile = await SitterProfile.findOne({ where: { userId } });
      if (!myProfile) return res.status(403).json({ error: 'Unauthorized' });

      const row = await BookingRequest.findByPk(id, {
        include: [
          { model: User, as: 'Owner', attributes: ['id', 'fullName', 'email'] },
          { model: Animal, as: 'Animal', attributes: ['id', 'name', 'animalType'] },
        ],
      });
      if (!row) return res.status(404).json({ error: 'Request not found' });
      if (Number(row.sitterProfileId) !== Number(myProfile.id)) return res.status(403).json({ error: 'Unauthorized' });
      if (row.status !== 'pending') return res.status(409).json({ error: 'Request already responded to' });

      if (status === 'accepted') {
        const overlapAccepted = await BookingRequest.findOne({
          where: {
            sitterProfileId: row.sitterProfileId,
            status: 'accepted',
            startDate: { [Op.lte]: row.endDate },
            endDate: { [Op.gte]: row.startDate },
          },
        });
        if (overlapAccepted) {
          return res.status(409).json({ error: 'These dates are no longer available' });
        }
      }

      row.status = status;
      row.respondedAt = new Date();
      await row.save();

      const payload = JSON.stringify({
        bookingRequestId: row.id,
        status,
        petName: row.Animal?.name || 'Pet',
        startDate: row.startDate,
        endDate: row.endDate,
      });

      await Notification.create({
        userId: row.ownerId,
        type: 'booking_response',
        entityType: 'booking_request',
        entityId: row.id,
        payload,
        readAt: null,
      });

      return res.status(200).json({ bookingRequest: row });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/bookings/unavailable/:sitterProfileId (public)
  static async unavailable(req, res, next) {
    try {
      const sitterProfileId = Number(req.params.sitterProfileId);
      if (!Number.isFinite(sitterProfileId)) return res.status(400).json({ error: 'Invalid sitterProfileId' });

      const rows = await BookingRequest.findAll({
        where: { sitterProfileId, status: 'accepted' },
        attributes: ['id', 'startDate', 'endDate'],
        order: [['startDate', 'ASC']],
        limit: 500,
      });

      return res.status(200).json({ count: rows.length, ranges: rows });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = BookingController;

