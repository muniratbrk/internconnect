const { query } = require('../config/db');
const { createNotification } = require('../services/notification.service');

async function getConversations(req, res, next) {
  try {
    const isStudent = req.user.role === 'student';
    const profileId = req.user.profileId;

    let sql = '';
    if (isStudent) {
      sql = `
        SELECT c.*,
               co.company_name AS participant_name,
               co.logo_url AS participant_avatar,
               co.industry AS participant_subtext,
               u.id AS participant_user_id,
               (SELECT content FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_message,
               (SELECT created_at FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_message_at,
               (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.sender_user_id != $1 AND m.is_read = FALSE) AS unread_count
        FROM conversations c
        JOIN company_profiles co ON c.company_id = co.id
        JOIN users u ON co.user_id = u.id
        WHERE c.student_id = $2
        ORDER BY COALESCE(last_message_at, c.created_at) DESC
      `;
    } else {
      sql = `
        SELECT c.*,
               s.full_name AS participant_name,
               s.avatar_url AS participant_avatar,
               s.university AS participant_subtext,
               u.id AS participant_user_id,
               (SELECT content FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_message,
               (SELECT created_at FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_message_at,
               (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.sender_user_id != $1 AND m.is_read = FALSE) AS unread_count
        FROM conversations c
        JOIN student_profiles s ON c.student_id = s.id
        JOIN users u ON s.user_id = u.id
        WHERE c.company_id = $2
        ORDER BY COALESCE(last_message_at, c.created_at) DESC
      `;
    }

    const result = await query(sql, [req.user.id, profileId]);
    res.json({ success: true, conversations: result.rows });
  } catch (error) {
    next(error);
  }
}

async function getMessages(req, res, next) {
  try {
    const { conversationId } = req.params;

    // Verify participant
    const convCheck = await query(`
      SELECT c.*, 
             s.user_id AS student_user_id,
             co.user_id AS company_user_id
      FROM conversations c
      JOIN student_profiles s ON c.student_id = s.id
      JOIN company_profiles co ON c.company_id = co.id
      WHERE c.id = $1
    `, [conversationId]);

    if (convCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    const conv = convCheck.rows[0];
    if (conv.student_user_id !== req.user.id && conv.company_user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized access to messages.' });
    }

    // Mark unread messages sent by the other party as read
    await query(`
      UPDATE messages
      SET is_read = TRUE
      WHERE conversation_id = $1 AND sender_user_id != $2 AND is_read = FALSE
    `, [conversationId, req.user.id]);

    const messages = await query(`
      SELECT m.*, u.email AS sender_email, u.role AS sender_role
      FROM messages m
      JOIN users u ON m.sender_user_id = u.id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at ASC
    `, [conversationId]);

    res.json({ success: true, messages: messages.rows });
  } catch (error) {
    next(error);
  }
}

async function sendMessage(req, res, next) {
  try {
    const { conversation_id, content } = req.body;

    if (!conversation_id || !content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Conversation ID and content are required.' });
    }

    // Check conversation and find recipient
    const convCheck = await query(`
      SELECT c.*, 
             s.user_id AS student_user_id,
             s.full_name AS student_name,
             co.user_id AS company_user_id,
             co.company_name
      FROM conversations c
      JOIN student_profiles s ON c.student_id = s.id
      JOIN company_profiles co ON c.company_id = co.id
      WHERE c.id = $1
    `, [conversation_id]);

    if (convCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    const conv = convCheck.rows[0];
    const isSenderStudent = req.user.id === conv.student_user_id;
    const recipientUserId = isSenderStudent ? conv.company_user_id : conv.student_user_id;
    const senderName = isSenderStudent ? conv.student_name : conv.company_name;

    const result = await query(`
      INSERT INTO messages (conversation_id, sender_user_id, content, is_read)
      VALUES ($1, $2, $3, FALSE)
      RETURNING *
    `, [conversation_id, req.user.id, content.trim()]);

    const message = result.rows[0];

    // Trigger notification to recipient
    await createNotification({
      userId: recipientUserId,
      title: `New message from ${senderName}`,
      message: content.length > 80 ? `${content.substring(0, 77)}...` : content,
      link: '/messages',
      type: 'new_message',
    });

    res.status(201).json({ success: true, message });
  } catch (error) {
    next(error);
  }
}

async function startConversation(req, res, next) {
  try {
    const { student_id, company_id, application_id } = req.body;

    let studId = student_id;
    let compId = company_id;

    if (req.user.role === 'student') {
      studId = req.user.profileId;
    } else if (req.user.role === 'company') {
      compId = req.user.profileId;
    }

    if (!studId || !compId) {
      return res.status(400).json({ success: false, message: 'student_id and company_id are required.' });
    }

    // Check if conversation already exists
    let existing = await query(
      'SELECT * FROM conversations WHERE student_id = $1 AND company_id = $2',
      [studId, compId]
    );

    if (existing.rows.length > 0) {
      return res.json({ success: true, conversation: existing.rows[0], isNew: false });
    }

    // Create conversation
    const result = await query(`
      INSERT INTO conversations (application_id, student_id, company_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [application_id || null, studId, compId]);

    res.status(201).json({ success: true, conversation: result.rows[0], isNew: true });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  startConversation,
};
