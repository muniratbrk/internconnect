const { query } = require('../config/db');
const { createNotification } = require('../services/notification.service');

async function getAnalytics(req, res, next) {
  try {
    const counts = await query(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'student') AS total_students,
        (SELECT COUNT(*) FROM users WHERE role = 'company') AS total_companies,
        (SELECT COUNT(*) FROM internships) AS total_postings,
        (SELECT COUNT(*) FROM internships WHERE status = 'open') AS active_postings,
        (SELECT COUNT(*) FROM applications) AS total_applications,
        (SELECT COUNT(*) FROM applications WHERE status = 'accepted') AS accepted_applications,
        (SELECT COUNT(*) FROM company_profiles WHERE is_verified = TRUE) AS verified_companies
    `);

    // Top required skills across all postings
    const skillsRes = await query(`
      SELECT unnest(required_skills) AS skill, COUNT(*) AS count
      FROM internships
      GROUP BY skill
      ORDER BY count DESC
      LIMIT 8
    `);

    // Pipeline breakdown
    const pipelineRes = await query(`
      SELECT status, COUNT(*) AS count
      FROM applications
      GROUP BY status
    `);

    const data = counts.rows[0];
    const totalApps = parseInt(data.total_applications, 10) || 0;
    const acceptedApps = parseInt(data.accepted_applications, 10) || 0;
    const acceptanceRate = totalApps > 0 ? Math.round((acceptedApps / totalApps) * 100) : 0;

    res.json({
      success: true,
      analytics: {
        totalStudents: parseInt(data.total_students, 10) || 0,
        totalCompanies: parseInt(data.total_companies, 10) || 0,
        totalPostings: parseInt(data.total_postings, 10) || 0,
        activePostings: parseInt(data.active_postings, 10) || 0,
        totalApplications: totalApps,
        acceptedApplications: acceptedApps,
        acceptanceRate,
        verifiedCompanies: parseInt(data.verified_companies, 10) || 0,
        topSkills: skillsRes.rows,
        pipelineBreakdown: pipelineRes.rows,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function listCompanies(req, res, next) {
  try {
    const result = await query(`
      SELECT c.*, u.email, u.created_at AS joined_at,
             COUNT(i.id) AS total_postings
      FROM company_profiles c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN internships i ON c.id = i.company_id
      GROUP BY c.id, u.email, u.created_at
      ORDER BY c.is_verified ASC, c.created_at DESC
    `);

    res.json({ success: true, companies: result.rows });
  } catch (error) {
    next(error);
  }
}

async function toggleCompanyVerification(req, res, next) {
  try {
    const { id } = req.params;
    const { is_verified } = req.body;

    const companyRes = await query(`
      UPDATE company_profiles
      SET is_verified = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [is_verified, id]);

    if (companyRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    const company = companyRes.rows[0];

    // Notify company
    await createNotification({
      userId: company.user_id,
      title: is_verified ? 'Company Verified Badge Granted!' : 'Company Verification Status Updated',
      message: is_verified
        ? 'Congratulations! Your company profile has been verified by the InternConnect admin team.'
        : 'Your verified status has been modified by the admin team.',
      link: '/company-profile',
      type: 'system',
    });

    res.json({
      success: true,
      message: `Company verification set to ${is_verified}.`,
      company,
    });
  } catch (error) {
    next(error);
  }
}

async function listPostings(req, res, next) {
  try {
    const result = await query(`
      SELECT i.*, c.company_name, c.logo_url,
             COUNT(a.id) AS applicant_count
      FROM internships i
      JOIN company_profiles c ON i.company_id = c.id
      LEFT JOIN applications a ON i.id = a.internship_id
      GROUP BY i.id, c.company_name, c.logo_url
      ORDER BY i.created_at DESC
    `);

    res.json({ success: true, postings: result.rows });
  } catch (error) {
    next(error);
  }
}

async function updatePostingStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['open', 'closed', 'draft', 'moderated'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const result = await query(`
      UPDATE internships
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Posting not found.' });
    }

    res.json({ success: true, message: `Posting status updated to ${status}.`, posting: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

async function listUsers(req, res, next) {
  try {
    const result = await query(`
      SELECT u.id, u.email, u.role, u.is_verified, u.created_at,
             COALESCE(s.full_name, c.company_name, 'Administrator') AS display_name
      FROM users u
      LEFT JOIN student_profiles s ON u.id = s.user_id
      LEFT JOIN company_profiles c ON u.id = c.user_id
      ORDER BY u.created_at DESC
    `);

    res.json({ success: true, users: result.rows });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAnalytics,
  listCompanies,
  toggleCompanyVerification,
  listPostings,
  updatePostingStatus,
  listUsers,
};
