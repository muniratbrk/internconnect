const express = require('express');
const router = express.Router();
const companyController = require('../controllers/company.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/profile', authenticate, requireRole(['company']), companyController.getProfile);
router.put('/profile', authenticate, requireRole(['company']), companyController.updateProfile);
router.post('/logo', authenticate, requireRole(['company']), upload.single('logo'), companyController.uploadLogo);
router.get('/', companyController.listCompanies);
router.get('/:id', companyController.getPublicCompany);

module.exports = router;
