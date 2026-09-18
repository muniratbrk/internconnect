const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { query } = require('../config/db');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Fetch user details
    const userResult = await query(
      'SELECT id, email, role, is_verified FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid token. User no longer exists.' });
    }

    req.user = userResult.rows[0];

    // Attach role-specific profile ID if present
    if (req.user.role === 'student') {
      const studentRes = await query('SELECT id, full_name, avatar_url, resume_url FROM student_profiles WHERE user_id = $1', [req.user.id]);
      if (studentRes.rows.length > 0) {
        req.user.studentProfile = studentRes.rows[0];
        req.user.profileId = studentRes.rows[0].id;
      }
    } else if (req.user.role === 'company') {
      const companyRes = await query('SELECT id, company_name, logo_url, is_verified FROM company_profiles WHERE user_id = $1', [req.user.id]);
      if (companyRes.rows.length > 0) {
        req.user.companyProfile = companyRes.rows[0];
        req.user.profileId = companyRes.rows[0].id;
      }
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid authentication token.' });
  }
}

// Optional authentication (for public endpoints like internship browsing that enhance results if logged in)
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, env.JWT_SECRET);
      const userResult = await query(
        'SELECT id, email, role, is_verified FROM users WHERE id = $1',
        [decoded.userId]
      );
      if (userResult.rows.length > 0) {
        req.user = userResult.rows[0];
        if (req.user.role === 'student') {
          const studentRes = await query('SELECT id, full_name, skills, location FROM student_profiles WHERE user_id = $1', [req.user.id]);
          if (studentRes.rows.length > 0) {
            req.user.studentProfile = studentRes.rows[0];
            req.user.profileId = studentRes.rows[0].id;
          }
        }
      }
    }
  } catch {
    // Ignore invalid tokens for optional auth
  }
  next();
}

function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to roles: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
}

module.exports = {
  authenticate,
  optionalAuth,
  requireRole,
};
