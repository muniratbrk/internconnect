const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

router.post('/', authenticate, requireRole(['student']), reviewController.createReview);
router.get('/company/:companyId', reviewController.getCompanyReviews);

module.exports = router;
