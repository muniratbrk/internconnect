const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/profile', authenticate, requireRole(['student']), studentController.getProfile);
router.put('/profile', authenticate, requireRole(['student']), studentController.updateProfile);
router.post('/resume', authenticate, requireRole(['student']), upload.single('resume'), studentController.uploadResume);
router.post('/avatar', authenticate, requireRole(['student']), upload.single('avatar'), studentController.uploadAvatar);
router.get('/:id', authenticate, studentController.getPublicProfile);

module.exports = router;
