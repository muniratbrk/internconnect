const express = require('express');
const router = express.Router();
const internshipController = require('../controllers/internship.controller');
const { authenticate, optionalAuth, requireRole } = require('../middleware/auth.middleware');

router.get('/', optionalAuth, internshipController.listInternships);
router.get('/recommended', authenticate, requireRole(['student']), internshipController.getRecommended);
router.get('/company/my-postings', authenticate, requireRole(['company']), internshipController.getCompanyPostings);
router.get('/:id', optionalAuth, internshipController.getInternshipById);
router.post('/', authenticate, requireRole(['company']), internshipController.createInternship);
router.put('/:id', authenticate, requireRole(['company', 'admin']), internshipController.updateInternship);
router.delete('/:id', authenticate, requireRole(['company', 'admin']), internshipController.deleteInternship);

module.exports = router;
