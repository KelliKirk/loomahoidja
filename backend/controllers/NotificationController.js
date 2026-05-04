const { Notification } = require('../models');

class NotificationController {
  static async list(req, res, next) {
    try {
      const userId = req.user.id;
      const unreadOnly = req.query.unreadOnly === 'true';

      const where = { userId };
      if (unreadOnly) where.readAt = null;

      const rows = await Notification.findAll({
        where,
        order: [['id', 'DESC']],
        limit: 200,
      });

      res.status(200).json({ count: rows.length, notifications: rows });
    } catch (err) {
      next(err);
    }
  }

  static async markRead(req, res, next) {
    try {
      const userId = req.user.id;
      const { ids } = req.body || {};
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'ids is required' });
      }

      const [updated] = await Notification.update(
        { readAt: new Date() },
        { where: { id: ids, userId, readAt: null } }
      );

      res.status(200).json({ updated });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = NotificationController;

