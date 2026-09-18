const { query } = require('../config/db');

async function getProfile(req, res, next) {
  try {
    const result = await query(
      `SELECT s.*, u.email, u.is_verified
       FROM student_profiles s
       JOIN users u ON s.user_id = u.id
       WHERE s.user_id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    res.json({ success: true, profile: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const {
      full_name,
      headline,
      bio,
      university,
      department,
      field_of_study,
      major,
      graduation_year,
      gpa,
      skills,
      portfolio_url,
      github_url,
      linkedin_url,
      availability,
      location,
      resume_url,
    } = req.body;

    // Normalize skills to array if passed as comma-separated string
    let skillsArray = [];
    if (Array.isArray(skills)) {
      skillsArray = skills;
    } else if (typeof skills === 'string') {
      skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);
    }

    const result = await query(`
      UPDATE student_profiles
      SET
        full_name = COALESCE($1, full_name),
        headline = COALESCE($2, headline),
        bio = COALESCE($3, bio),
        university = COALESCE($4, university),
        department = COALESCE($5, department),
        field_of_study = COALESCE($6, field_of_study),
        major = COALESCE($7, major),
        graduation_year = COALESCE($8, graduation_year),
        gpa = COALESCE($9, gpa),
        skills = COALESCE($10, skills),
        portfolio_url = COALESCE($11, portfolio_url),
        github_url = COALESCE($12, github_url),
        linkedin_url = COALESCE($13, linkedin_url),
        availability = COALESCE($14, availability),
        location = COALESCE($15, location),
        resume_url = COALESCE($16, resume_url),
        updated_at = NOW()
      WHERE user_id = $17
      RETURNING *
    `, [
      full_name,
      headline,
      bio,
      university,
      department,
      field_of_study,
      major,
      graduation_year ? parseInt(graduation_year, 10) : null,
      gpa ? parseFloat(gpa) : null,
      skills ? skillsArray : null,
      portfolio_url,
      github_url,
      linkedin_url,
      availability,
      location,
      resume_url,
      req.user.id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    res.json({ success: true, message: 'Profile updated successfully.', profile: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

async function uploadResume(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No resume file uploaded.' });
    }

    const fileUrl = `/uploads/resumes/${req.file.filename}`;

    const result = await query(`
      UPDATE student_profiles
      SET resume_url = $1, updated_at = NOW()
      WHERE user_id = $2
      RETURNING id, full_name, resume_url
    `, [fileUrl, req.user.id]);

    res.json({
      success: true,
      message: 'Resume uploaded successfully.',
      resume_url: fileUrl,
      fileName: req.file.originalname,
      profile: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

async function uploadAvatar(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No avatar image uploaded.' });
    }

    const fileUrl = `/uploads/avatars/${req.file.filename}`;

    const result = await query(`
      UPDATE student_profiles
      SET avatar_url = $1, updated_at = NOW()
      WHERE user_id = $2
      RETURNING id, full_name, avatar_url
    `, [fileUrl, req.user.id]);

    res.json({
      success: true,
      message: 'Avatar uploaded successfully.',
      avatar_url: fileUrl,
      profile: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

async function getPublicProfile(req, res, next) {
  try {
    const { id } = req.params;
    const result = await query(`
      SELECT s.*, u.email
      FROM student_profiles s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    res.json({ success: true, profile: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  uploadResume,
  uploadAvatar,
  getPublicProfile,
};
