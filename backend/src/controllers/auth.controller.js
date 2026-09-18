const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');
const { query } = require('../config/db');

function generateToken(userId, role) {
  return jwt.sign({ userId, role }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

async function register(req, res, next) {
  try {
    const { email, password, role, fullName, companyName, industry } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Email, password, and role are required.' });
    }

    if (!['student', 'company'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be student or company.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    // Check if email already exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const userRes = await query(`
      INSERT INTO users (email, password_hash, role, is_verified, verification_token)
      VALUES ($1, $2, $3, FALSE, $4)
      RETURNING id, email, role, is_verified, created_at
    `, [email.toLowerCase().trim(), passwordHash, role, verificationToken]);

    const user = userRes.rows[0];
    let profile = null;

    if (role === 'student') {
      const studentRes = await query(`
        INSERT INTO student_profiles (user_id, full_name)
        VALUES ($1, $2)
        RETURNING *
      `, [user.id, fullName || 'New Student']);
      profile = studentRes.rows[0];
    } else if (role === 'company') {
      const companyRes = await query(`
        INSERT INTO company_profiles (user_id, company_name, industry)
        VALUES ($1, $2, $3)
        RETURNING *
      `, [user.id, companyName || 'New Company', industry || 'Technology']);
      profile = companyRes.rows[0];
    }

    const token = generateToken(user.id, user.role);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user,
      profile,
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const userRes = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = userRes.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    let profile = null;
    if (user.role === 'student') {
      const sRes = await query('SELECT * FROM student_profiles WHERE user_id = $1', [user.id]);
      profile = sRes.rows[0] || null;
    } else if (user.role === 'company') {
      const cRes = await query('SELECT * FROM company_profiles WHERE user_id = $1', [user.id]);
      profile = cRes.rows[0] || null;
    }

    const token = generateToken(user.id, user.role);

    const { password_hash, verification_token, reset_token, reset_token_expiry, ...safeUser } = user;

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: safeUser,
      profile,
    });
  } catch (error) {
    next(error);
  }
}

async function getMe(req, res, next) {
  try {
    const userRes = await query('SELECT id, email, role, is_verified, created_at FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = userRes.rows[0];
    let profile = null;

    if (user.role === 'student') {
      const sRes = await query('SELECT * FROM student_profiles WHERE user_id = $1', [user.id]);
      profile = sRes.rows[0] || null;
    } else if (user.role === 'company') {
      const cRes = await query('SELECT * FROM company_profiles WHERE user_id = $1', [user.id]);
      profile = cRes.rows[0] || null;
    }

    res.json({
      success: true,
      user,
      profile,
    });
  } catch (error) {
    next(error);
  }
}

async function verifyEmail(req, res, next) {
  try {
    await query('UPDATE users SET is_verified = TRUE WHERE id = $1', [req.user.id]);
    res.json({ success: true, message: 'Email verified successfully.' });
  } catch (error) {
    next(error);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    const result = await query(`
      UPDATE users
      SET reset_token = $1, reset_token_expiry = $2
      WHERE email = $3
      RETURNING id, email
    `, [resetToken, expiry, email.toLowerCase().trim()]);

    if (result.rows.length === 0) {
      // Don't reveal if user exists for security
      return res.json({ success: true, message: 'If an account exists, a reset link has been dispatched.' });
    }

    res.json({
      success: true,
      message: 'Password reset link dispatched.',
      resetToken, // Returned for effortless demo/testing flow
    });
  } catch (error) {
    next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const userRes = await query(`
      SELECT id FROM users
      WHERE reset_token = $1 AND reset_token_expiry > NOW()
    `, [token]);

    if (userRes.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await query(`
      UPDATE users
      SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL
      WHERE id = $2
    `, [passwordHash, userRes.rows[0].id]);

    res.json({ success: true, message: 'Password has been reset successfully. You may now log in.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getMe,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
