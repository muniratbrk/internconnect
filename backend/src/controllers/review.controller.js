const { query } = require('../config/db');

async function createReview(req, res, next) {
  try {
    const { internship_id, company_id, rating, comment } = req.body;
    const studentId = req.user.profileId;

    if (!company_id || !rating) {
      return res.status(400).json({ success: false, message: 'company_id and rating (1-5) are required.' });
    }

    const numRating = parseInt(rating, 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5.' });
    }

    const result = await query(`
      INSERT INTO reviews (internship_id, student_id, company_id, reviewer_role, rating, comment)
      VALUES ($1, $2, $3, 'student', $4, $5)
      RETURNING *
    `, [internship_id || null, studentId, company_id, numRating, comment || null]);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully.',
      review: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

async function getCompanyReviews(req, res, next) {
  try {
    const { companyId } = req.params;

    const reviews = await query(`
      SELECT r.*, s.full_name AS student_name, s.avatar_url AS student_avatar, s.university AS student_university,
             i.title AS internship_title
      FROM reviews r
      JOIN student_profiles s ON r.student_id = s.id
      LEFT JOIN internships i ON r.internship_id = i.id
      WHERE r.company_id = $1
      ORDER BY r.created_at DESC
    `, [companyId]);

    const stats = await query(`
      SELECT AVG(rating) AS average_rating, COUNT(*) AS total_reviews
      FROM reviews
      WHERE company_id = $1
    `, [companyId]);

    res.json({
      success: true,
      averageRating: parseFloat(stats.rows[0].average_rating) || 0,
      totalReviews: parseInt(stats.rows[0].total_reviews, 10) || 0,
      reviews: reviews.rows,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createReview,
  getCompanyReviews,
};
