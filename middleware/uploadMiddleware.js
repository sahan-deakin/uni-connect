const multer = require('multer');

const path = require('path');

// Storage config
const fs = require('fs');

const uploadPath = 'uploads/';

if (!fs.existsSync(uploadPath)) {

  fs.mkdirSync(uploadPath, {
    recursive: true
  });
}

const storage = multer.diskStorage({

  destination: function (req, file, cb) {

    cb(null, 'uploads/');
  },

  filename: function (req, file, cb) {

    const uniqueName =
      Date.now() + path.extname(file.originalname);

    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {

  const allowedTypes = [
    '.pdf',
    '.doc',
    '.docx',
    '.ppt',
    '.pptx',
    '.zip'
  ];

  const ext =
    path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(ext)) {

    cb(null, true);

  } else {

    cb(new Error('Unsupported file type'));
  }
};

const upload = multer({

  storage,

  fileFilter,

  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

module.exports = upload;