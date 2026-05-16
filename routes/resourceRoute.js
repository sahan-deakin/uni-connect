const express    = require('express');
const multer     = require('multer');
const router     = express.Router();
const controller = require('../controllers/resourceController');
const { requireAuth, requireModerator } = require('../middleware/auth');

//Multer configuration
const ALLOWED_MIMES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/png',
  'image/jpeg',
  'application/zip',
  'application/x-zip-compressed',
];
 

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE',
        'Only PDF, Word, PowerPoint, PNG, JPG, and ZIP files are accepted.'));
    }
  },
});

//File upload error handler
function handleUpload(req, res, next) {
  upload.single('file')(req, res, err => {
    if (err instanceof multer.MulterError) {
      const message = err.code === 'LIMIT_FILE_SIZE'
        ? 'File exceeds the 10 MB limit. Upload to Google Drive and paste a link instead.'
        : err.message;
 
      return res.status(400).render('resources/upload', {
        user:      req.user,
        pageTitle: 'Upload Resource',
        errors:    [message],
        formData:  req.body,
      });
    }
    if (err) return next(err);
    next();
  });
}

// GET  /resources to browse the resource library
router.get('/', controller.index);
 
// GET  /resources/:id to view a single resource
router.get('/:id', controller.show);

 
// GET  /resources/upload to show the upload form
router.get('/upload', requireAuth, controller.showUploadForm);
 
// POST /resources/upload to process the upload submission
router.post('/upload', requireAuth, handleUpload, controller.upload);
 
// GET  /resources/:id/downloadto serve the file (authenticated)
router.get('/:id/download', requireAuth, controller.download);
 
// POST /resources/:id/upvote to toggle upvote (AJAX)
router.post('/:id/upvote', requireAuth, controller.upvote);
 
// POST /resources/:id/flag to flag a resource (AJAX)
router.post('/:id/flag', requireAuth, controller.flag);
 
// DELETE /resources/:id to soft-delete (owner or moderator, AJAX)
router.delete('/:id', requireAuth, controller.destroy);

module.exports = router;