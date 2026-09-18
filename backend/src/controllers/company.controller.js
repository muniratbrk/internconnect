const { query } = require('../config/db');

async function getProfile(req, res, next) {
  try {
    const result = await query(
      `SELECT c.*, u.email
       FROM company_profiles c
       JOIN users u ON c.user_id = u.id
       WHERE c.user_id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Company profile not found.' });
    }

    res.json({ success: true, profile: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { company_name, industry, description, website, location, size } = req.body;

    const result = await query(`
      UPDATE company_profiles
      SET
        company_name = COALESCE($1, company_name),
        industry = COALESCE($2, industry),
        description = COALESCE($3, description),
        website = COALESCE($4, website),
        location = COALESCE($5, location),
        size = COALESCE($6, size),
        updated_at = NOW()
      WHERE user_id = $7
      RETURNING *
    `, [company_name, industry, description, website, location, size, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Company profile not found.' });
    }

    res.json({ success: true, message: 'Company profile updated.', profile: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

async function uploadLogo(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No logo image uploaded.' });
    }

    const fileUrl = `/uploads/logos/${req.file.filename}`;

    const result = await query(`
      UPDATE company_profiles
      SET logo_url = $1, updated_at = NOW()
      WHERE user_id = $2
      RETURNING id, company_name, logo_url
    `, [fileUrl, req.user.id]);

    res.json({
      success: true,
      message: 'Company logo uploaded successfully.',
      logo_url: fileUrl,
      profile: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

async function listCompanies(req, res, next) {
  try {
    const { verified, industry, search } = req.query;
    let sql = `
      SELECT c.*, 
             COUNT(DISTINCT i.id) AS active_postings_count,
             COALESCE(AVG(r.rating), 0) AS average_rating
      FROM company_profiles c
      LEFT JOIN internships i ON c.id = i.company_id AND i.status = 'open'
      LEFT JOIN reviews r ON c.id = r.company_id
      WHERE 1=1
    `;
    const params = [];

    if (verified === 'true') {
      sql += ' AND c.is_verified = TRUE';
    }

    if (industry) {
      params.push(`%${industry}%`);
      sql += ` AND c.industry ILIKE $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (c.company_name ILIKE $${params.length} OR c.description ILIKE $${params.length})`;
    }

    sql += ' GROUP BY c.id ORDER BY c.company_name ASC';

    const result = await query(sql, params);
    res.json({ success: true, companies: result.rows });
  } catch (error) {
    next(error);
  }
}

async function getPublicCompany(req, res, next) {
  try {
    const { id } = req.params;

    const companyRes = await query(`
      SELECT c.*,
             COALESCE(AVG(r.rating), 0) AS average_rating,
             COUNT(r.id) AS reviews_count
      FROM company_profiles c
      LEFT JOIN reviews r ON c.id = r.company_id
      WHERE c.id = $1
      GROUP BY c.id
    `, [id]);

    if (companyRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    // Fetch active internships for this company
    const postingsRes = await query(`
      SELECT * FROM internships
      WHERE company_id = $1 AND status = 'open'
      ORDER BY created_at DESC
    `, [id]);

    // Fetch reviews
    const reviewsRes = await query(`
      SELECT r.*, s.full_name AS student_name, s.avatar_url AS student_avatar
      FROM reviews r
      JOIN student_profiles s ON r.student_id = s.id
      WHERE r.company_id = $1
      ORDER BY r.created_at DESC
    `, [id]);

    res.json({
      success: true,
      company: companyRes.rows[0],
      postings: postingsRes.rows,
      reviews: reviewsRes.rows,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  uploadLogo,
  listCompanies,
  getPublicCompany,
};
