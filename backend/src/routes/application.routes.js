const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/application.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

router.post('/', authenticate, requireRole(['student']), applicationController.apply);
router.get('/student', authenticate, requireRole(['student']), applicationController.getStudentApplications);
router.get('/internship/:internshipId', authenticate, requireRole(['company', 'admin']), applicationController.getInternshipApplicants);
router.put('/:id/status', authenticate, requireRole(['company', 'admin']), applicationController.updateApplicationStatus);
router.get('/:id', authenticate, applicationController.getApplicationById);

module.exports = router;
