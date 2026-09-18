const { query } = require('../config/db');
const { createNotification } = require('../services/notification.service');

async function apply(req, res, next) {
  try {
    const { internship_id, resume_url, cover_note } = req.body;
    const studentId = req.user.profileId;

    if (!internship_id) {
      return res.status(400).json({ success: false, message: 'internship_id is required.' });
    }

    // Verify internship is open
    const jobRes = await query(`
      SELECT i.*, c.user_id AS company_user_id, c.company_name
      FROM internships i
      JOIN company_profiles c ON i.company_id = c.id
      WHERE i.id = $1
    `, [internship_id]);

    if (jobRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Internship posting not found.' });
    }

    const internship = jobRes.rows[0];
    if (internship.status !== 'open') {
      return res.status(400).json({ success: false, message: 'This internship is no longer accepting applications.' });
    }

    // Check if student already applied
    const existing = await query(
      'SELECT id FROM applications WHERE internship_id = $1 AND student_id = $2',
      [internship_id, studentId]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'You have already applied for this opportunity.' });
    }

    // Determine resume URL (either explicitly submitted or student's profile default)
    let finalResumeUrl = resume_url;
    if (!finalResumeUrl) {
      const studRes = await query('SELECT resume_url, full_name FROM student_profiles WHERE id = $1', [studentId]);
      finalResumeUrl = studRes.rows[0]?.resume_url;
    }

    const appRes = await query(`
      INSERT INTO applications (internship_id, student_id, resume_url, cover_note, status)
      VALUES ($1, $2, $3, $4, 'applied')
      RETURNING *
    `, [internship_id, studentId, finalResumeUrl, cover_note || null]);

    const application = appRes.rows[0];

    // Trigger in-app notification to the company
    const studentName = req.user.studentProfile?.full_name || 'A student';
    await createNotification({
      userId: internship.company_user_id,
      title: 'New Applicant Received',
      message: `${studentName} applied for "${internship.title}".`,
      link: `/company-dashboard?jobId=${internship.id}`,
      type: 'new_application',
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      application,
    });
  } catch (error) {
    next(error);
  }
}

async function getStudentApplications(req, res, next) {
  try {
    const studentId = req.user.profileId;

    const result = await query(`
      SELECT a.*,
             i.title AS internship_title,
             i.department AS internship_department,
             i.field_of_study AS internship_field_of_study,
             i.location AS internship_location,
             i.is_remote,
             i.work_type,
             i.is_paid,
             i.stipend_amount,
             i.stipend_currency,
             i.duration,
             i.status AS internship_status,
             c.id AS company_id,
             c.company_name,
             c.logo_url AS company_logo,
             c.is_verified AS company_verified
      FROM applications a
      JOIN internships i ON a.internship_id = i.id
      JOIN company_profiles c ON i.company_id = c.id
      WHERE a.student_id = $1
      ORDER BY a.applied_at DESC
    `, [studentId]);

    res.json({ success: true, applications: result.rows });
  } catch (error) {
    next(error);
  }
}

async function getInternshipApplicants(req, res, next) {
  try {
    const { internshipId } = req.params;
    const companyId = req.user.profileId;

    // Verify ownership
    const check = await query('SELECT id, title FROM internships WHERE id = $1 AND company_id = $2', [internshipId, companyId]);
    if (check.rows.length === 0 && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized access to applicants.' });
    }

    const result = await query(`
      SELECT a.*,
             s.full_name AS student_name,
             s.headline AS student_headline,
             s.department AS student_department,
             s.field_of_study AS student_field_of_study,
             s.avatar_url AS student_avatar,
             s.university AS student_university,
             s.major AS student_major,
             s.graduation_year AS student_graduation_year,
             s.gpa AS student_gpa,
             s.skills AS student_skills,
             s.portfolio_url AS student_portfolio,
             s.github_url AS student_github,
             s.linkedin_url AS student_linkedin,
             u.email AS student_email,
             u.id AS student_user_id
      FROM applications a
      JOIN student_profiles s ON a.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE a.internship_id = $1
      ORDER BY a.applied_at DESC
    `, [internshipId]);

    res.json({ success: true, applicants: result.rows });
  } catch (error) {
    next(error);
  }
}

async function updateApplicationStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, company_notes } = req.body;

    const validStatuses = ['applied', 'under_review', 'interview', 'accepted', 'rejected'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    // Fetch existing application with student and company details
    const appQuery = await query(`
      SELECT a.*,
             s.user_id AS student_user_id,
             s.full_name AS student_name,
             i.title AS internship_title,
             i.company_id,
             c.company_name
      FROM applications a
      JOIN student_profiles s ON a.student_id = s.id
      JOIN internships i ON a.internship_id = i.id
      JOIN company_profiles c ON i.company_id = c.id
      WHERE a.id = $1
    `, [id]);

    if (appQuery.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const app = appQuery.rows[0];

    // Ensure only the company that owns the internship (or an admin) can update status
    if (app.company_id !== req.user.profileId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this application.' });
    }

    const updated = await query(`
      UPDATE applications
      SET
        status = COALESCE($1, status),
        company_notes = COALESCE($2, company_notes),
        updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `, [status, company_notes, id]);

    // Send notification to student if status changed
    if (status && status !== app.status) {
      const statusLabels = {
        under_review: 'Under Review',
        interview: 'Interview Scheduled',
        accepted: 'Accepted / Offer Extended',
        rejected: 'Decision Finalized (Not Moving Forward)',
      };

      await createNotification({
        userId: app.student_user_id,
        title: status === 'accepted' ? 'Congratulations! Offer Received' : 'Application Status Update',
        message: `${app.company_name} updated your application for "${app.internship_title}" to: ${statusLabels[status] || status}.`,
        link: '/student-dashboard',
        type: 'application_status',
      });
    }

    res.json({
      success: true,
      message: 'Application status updated successfully.',
      application: updated.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

async function getApplicationById(req, res, next) {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT a.*,
             i.title AS internship_title,
             i.department AS internship_department,
             i.field_of_study AS internship_field_of_study,
             i.description AS internship_description,
             i.location AS internship_location,
             i.is_remote,
             i.duration,
             i.stipend_amount,
             i.stipend_currency,
             c.company_name,
             c.logo_url AS company_logo,
             s.full_name AS student_name,
             s.headline AS student_headline,
             s.department AS student_department,
             s.field_of_study AS student_field_of_study,
             s.university AS student_university,
             s.skills AS student_skills
      FROM applications a
      JOIN internships i ON a.internship_id = i.id
      JOIN company_profiles c ON i.company_id = c.id
      JOIN student_profiles s ON a.student_id = s.id
      WHERE a.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    res.json({ success: true, application: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  apply,
  getStudentApplications,
  getInternshipApplicants,
  updateApplicationStatus,
  getApplicationById,
};
