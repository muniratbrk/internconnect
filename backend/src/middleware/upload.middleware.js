const multer = require('multer');
const path = require('path');
const fs = require('fs');
const env = require('../config/env');

// Ensure upload directories exist
const uploadDirs = ['resumes', 'avatars', 'logos'];
uploadDirs.forEach((subDir) => {
  const fullPath = path.join(env.UPLOAD_DIR, subDir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subDir = 'resumes';
    if (file.fieldname === 'avatar') subDir = 'avatars';
    else if (file.fieldname === 'logo') subDir = 'logos';
    cb(null, path.join(env.UPLOAD_DIR, subDir));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'resume') {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext) || file.mimetype === 'application/pdf') {
      return cb(null, true);
    }
    return cb(new Error('Only PDF and Word documents are permitted for resumes!'), false);
  }

  // Image files for avatar or logo
  if (file.mimetype.startsWith('image/')) {
    return cb(null, true);
  }

  cb(new Error('Invalid file type! Only image files are allowed.'), false);
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter,
});

module.exports = upload;
