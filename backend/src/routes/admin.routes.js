const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

router.use(authenticate);
router.use(requireRole(['admin']));

router.get('/analytics', adminController.getAnalytics);
router.get('/companies', adminController.listCompanies);
router.put('/companies/:id/verify', adminController.toggleCompanyVerification);
router.get('/postings', adminController.listPostings);
router.put('/postings/:id/status', adminController.updatePostingStatus);
router.get('/users', adminController.listUsers);

module.exports = router;
