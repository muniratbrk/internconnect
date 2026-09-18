const { query } = require('../config/db');
const { calculateMatchScore } = require('../services/matching.service');

async function listInternships(req, res, next) {
  try {
    const {
      search,
      skill,
      location,
      department,
      field_of_study,
      is_paid,
      is_remote,
      duration,
      work_type,
      sort,
    } = req.query;

    let sql = `
      SELECT i.*,
             c.company_name,
             c.logo_url,
             c.industry,
             c.is_verified AS company_verified,
             c.location AS company_location
      FROM internships i
      JOIN company_profiles c ON i.company_id = c.id
      WHERE i.status = 'open'
    `;
    const params = [];

    if (search) {
      params.push(`%${search.toLowerCase().trim()}%`);
      sql += ` AND (LOWER(i.title) LIKE $${params.length} OR LOWER(i.description) LIKE $${params.length} OR LOWER(c.company_name) LIKE $${params.length})`;
    }

    if (skill) {
      params.push(skill.trim());
      sql += ` AND $${params.length} = ANY(i.required_skills)`;
    }

    if (department) {
      params.push(`%${department.toLowerCase().trim()}%`);
      sql += ` AND LOWER(i.department) LIKE $${params.length}`;
    }

    if (field_of_study) {
      params.push(`%${field_of_study.toLowerCase().trim()}%`);
      sql += ` AND LOWER(i.field_of_study) LIKE $${params.length}`;
    }

    if (location) {
      params.push(`%${location.toLowerCase().trim()}%`);
      sql += ` AND LOWER(i.location) LIKE $${params.length}`;
    }

    if (is_paid !== undefined && is_paid !== '') {
      params.push(is_paid === 'true');
      sql += ` AND i.is_paid = $${params.length}`;
    }

    if (is_remote !== undefined && is_remote !== '') {
      params.push(is_remote === 'true');
      sql += ` AND i.is_remote = $${params.length}`;
    }

    if (duration) {
      params.push(duration);
      sql += ` AND i.duration = $${params.length}`;
    }

    if (work_type) {
      params.push(work_type);
      sql += ` AND i.work_type = $${params.length}`;
    }

    sql += ' ORDER BY i.created_at DESC';

    const result = await query(sql, params);
    let postings = result.rows;

    // If a student user is attached via optionalAuth, compute match score for each listing
    if (req.user && req.user.studentProfile) {
      postings = postings.map((job) => {
        const match = calculateMatchScore(req.user.studentProfile, job);
        return {
          ...job,
          match,
        };
      });

      if (sort === 'recommended') {
        postings.sort((a, b) => (b.match?.overallScore || 0) - (a.match?.overallScore || 0));
      }
    }

    res.json({ success: true, count: postings.length, internships: postings });
  } catch (error) {
    next(error);
  }
}

async function getRecommended(req, res, next) {
  try {
    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Student access required.' });
    }

    const studentRes = await query('SELECT * FROM student_profiles WHERE user_id = $1', [req.user.id]);
    if (studentRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }
    const student = studentRes.rows[0];

    const result = await query(`
      SELECT i.*,
             c.company_name,
             c.logo_url,
             c.industry,
             c.is_verified AS company_verified,
             c.location AS company_location
      FROM internships i
      JOIN company_profiles c ON i.company_id = c.id
      WHERE i.status = 'open'
    `);

    const recommendations = result.rows.map((job) => {
      const match = calculateMatchScore(student, job);
      return {
        ...job,
        match,
      };
    });

    recommendations.sort((a, b) => b.match.overallScore - a.match.overallScore);

    res.json({
      success: true,
      recommendations: recommendations.slice(0, 6), // Top 6 recommendations
    });
  } catch (error) {
    next(error);
  }
}

async function getInternshipById(req, res, next) {
  try {
    const { id } = req.params;

    // Increment view count
    await query('UPDATE internships SET views_count = views_count + 1 WHERE id = $1', [id]);

    const result = await query(`
      SELECT i.*,
             c.id AS company_id,
             c.company_name,
             c.logo_url,
             c.industry,
             c.description AS company_description,
             c.website AS company_website,
             c.size AS company_size,
             c.location AS company_location,
             c.is_verified AS company_verified
      FROM internships i
      JOIN company_profiles c ON i.company_id = c.id
      WHERE i.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Internship posting not found.' });
    }

    const internship = result.rows[0];

    let match = null;
    let existingApplication = null;

    if (req.user && req.user.role === 'student' && req.user.profileId) {
      const studentRes = await query('SELECT * FROM student_profiles WHERE id = $1', [req.user.profileId]);
      if (studentRes.rows.length > 0) {
        match = calculateMatchScore(studentRes.rows[0], internship);
      }

      const appRes = await query(
        'SELECT id, status, applied_at FROM applications WHERE internship_id = $1 AND student_id = $2',
        [id, req.user.profileId]
      );
      if (appRes.rows.length > 0) {
        existingApplication = appRes.rows[0];
      }
    }

    res.json({
      success: true,
      internship: {
        ...internship,
        match,
        existingApplication,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function createInternship(req, res, next) {
  try {
    const {
      title,
      department,
      field_of_study,
      description,
      requirements,
      responsibilities,
      location,
      is_remote,
      work_type,
      is_paid,
      stipend_amount,
      stipend_currency,
      duration,
      required_skills,
      application_deadline,
    } = req.body;

    if (!title || !description || !requirements || !location) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, requirements, and location are required.',
      });
    }

    let skillsArray = [];
    if (Array.isArray(required_skills)) {
      skillsArray = required_skills;
    } else if (typeof required_skills === 'string') {
      skillsArray = required_skills.split(',').map((s) => s.trim()).filter(Boolean);
    }

    const result = await query(`
      INSERT INTO internships (
        company_id, title, department, field_of_study, description, requirements, responsibilities,
        location, is_remote, work_type, is_paid, stipend_amount, stipend_currency,
        duration, required_skills, application_deadline, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 'open')
      RETURNING *
    `, [
      req.user.profileId,
      title,
      department || 'Software Engineering',
      field_of_study || 'Web & Full-Stack Development',
      description,
      requirements,
      responsibilities || null,
      location,
      is_remote === true || is_remote === 'true',
      work_type || 'Full-time',
      is_paid === undefined ? true : (is_paid === true || is_paid === 'true'),
      stipend_amount ? parseFloat(stipend_amount) : null,
      stipend_currency || 'ETB',
      duration || '3 Months',
      skillsArray,
      application_deadline || null,
    ]);

    res.status(201).json({
      success: true,
      message: 'Internship opportunity posted successfully.',
      internship: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

async function updateInternship(req, res, next) {
  try {
    const { id } = req.params;
    const {
      title,
      department,
      field_of_study,
      description,
      requirements,
      responsibilities,
      location,
      is_remote,
      work_type,
      is_paid,
      stipend_amount,
      stipend_currency,
      duration,
      required_skills,
      application_deadline,
      status,
    } = req.body;

    // Verify ownership
    const check = await query('SELECT company_id FROM internships WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Internship not found.' });
    }
    if (check.rows[0].company_id !== req.user.profileId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this posting.' });
    }

    let skillsArray = null;
    if (required_skills) {
      skillsArray = Array.isArray(required_skills)
        ? required_skills
        : required_skills.split(',').map((s) => s.trim()).filter(Boolean);
    }

    const result = await query(`
      UPDATE internships
      SET
        title = COALESCE($1, title),
        department = COALESCE($2, department),
        field_of_study = COALESCE($3, field_of_study),
        description = COALESCE($4, description),
        requirements = COALESCE($5, requirements),
        responsibilities = COALESCE($6, responsibilities),
        location = COALESCE($7, location),
        is_remote = COALESCE($8, is_remote),
        work_type = COALESCE($9, work_type),
        is_paid = COALESCE($10, is_paid),
        stipend_amount = COALESCE($11, stipend_amount),
        stipend_currency = COALESCE($12, stipend_currency),
        duration = COALESCE($13, duration),
        required_skills = COALESCE($14, required_skills),
        application_deadline = COALESCE($15, application_deadline),
        status = COALESCE($16, status),
        updated_at = NOW()
      WHERE id = $17
      RETURNING *
    `, [
      title,
      department,
      field_of_study,
      description,
      requirements,
      responsibilities,
      location,
      is_remote !== undefined ? (is_remote === true || is_remote === 'true') : null,
      work_type,
      is_paid !== undefined ? (is_paid === true || is_paid === 'true') : null,
      stipend_amount ? parseFloat(stipend_amount) : null,
      stipend_currency,
      duration,
      skillsArray,
      application_deadline,
      status,
      id,
    ]);

    res.json({
      success: true,
      message: 'Internship updated successfully.',
      internship: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

async function deleteInternship(req, res, next) {
  try {
    const { id } = req.params;

    const check = await query('SELECT company_id FROM internships WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Internship not found.' });
    }
    if (check.rows[0].company_id !== req.user.profileId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this posting.' });
    }

    await query('DELETE FROM internships WHERE id = $1', [id]);
    res.json({ success: true, message: 'Internship posting deleted.' });
  } catch (error) {
    next(error);
  }
}

async function getCompanyPostings(req, res, next) {
  try {
    const result = await query(`
      SELECT i.*,
             COUNT(a.id) AS total_applicants,
             COUNT(CASE WHEN a.status = 'applied' THEN 1 END) AS applied_count,
             COUNT(CASE WHEN a.status = 'under_review' THEN 1 END) AS under_review_count,
             COUNT(CASE WHEN a.status = 'interview' THEN 1 END) AS interview_count,
             COUNT(CASE WHEN a.status = 'accepted' THEN 1 END) AS accepted_count,
             COUNT(CASE WHEN a.status = 'rejected' THEN 1 END) AS rejected_count
      FROM internships i
      LEFT JOIN applications a ON i.id = a.internship_id
      WHERE i.company_id = $1
      GROUP BY i.id
      ORDER BY i.created_at DESC
    `, [req.user.profileId]);

    res.json({ success: true, postings: result.rows });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listInternships,
  getRecommended,
  getInternshipById,
  createInternship,
  updateInternship,
  deleteInternship,
  getCompanyPostings,
};
