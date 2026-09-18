const { query } = require('../config/db');

async function getNotifications(req, res, next) {
  try {
    const result = await query(`
      SELECT * FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 50
    `, [req.user.id]);

    const unread = result.rows.filter((n) => !n.is_read).length;

    res.json({
      success: true,
      unreadCount: unread,
      notifications: result.rows,
    });
  } catch (error) {
    next(error);
  }
}

async function markRead(req, res, next) {
  try {
    const { id } = req.params;
    await query(`
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = $1 AND user_id = $2
    `, [id, req.user.id]);

    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    next(error);
  }
}

async function markAllRead(req, res, next) {
  try {
    await query(`
      UPDATE notifications
      SET is_read = TRUE
      WHERE user_id = $1
    `, [req.user.id]);

    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
}

async function getUnreadCount(req, res, next) {
  try {
    const result = await query(`
      SELECT COUNT(*) AS unread_count
      FROM notifications
      WHERE user_id = $1 AND is_read = FALSE
    `, [req.user.id]);

    res.json({
      success: true,
      unreadCount: parseInt(result.rows[0].unread_count, 10) || 0,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getNotifications,
  markRead,
  markAllRead,
  getUnreadCount,
};
