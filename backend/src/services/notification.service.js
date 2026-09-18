const { query } = require('../config/db');

async function createNotification({ userId, title, message, link = null, type = 'system' }) {
  try {
    const res = await query(`
      INSERT INTO notifications (user_id, title, message, link, type, is_read)
      VALUES ($1, $2, $3, $4, $5, FALSE)
      RETURNING id, user_id, title, message, link, type, is_read, created_at
    `, [userId, title, message, link, type]);

    // Simulate email notification delivery
    sendEmailSimulation({
      toUserId: userId,
      subject: `[InternConnect] ${title}`,
      content: message,
    });

    return res.rows[0];
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}

function sendEmailSimulation({ toUserId, subject, content }) {
  // In production, integrate SendGrid, AWS SES, or Nodemailer
  console.log(`[EMAIL SIMULATOR] To User ${toUserId} | Subject: "${subject}" | Content: "${content}"`);
}

module.exports = {
  createNotification,
  sendEmailSimulation,
};
