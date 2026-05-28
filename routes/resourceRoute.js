const express = require('express');

const router = express.Router();

const resourceController = require('../controllers/resourceController');

const upload = require('../middleware/uploadMiddleware');

// GET all resources
router.get('/', resourceController.getAllResources);

// GET reported resources — MUST be before /:id so Express doesn't swallow "reported" as an id
router.get('/reported', resourceController.getReportedResources);

// GET single resource
router.get('/:id', resourceController.getResourceById);

// CREATE resource
router.post(
  '/',
  upload.single('resourceFile'),
  resourceController.createResource
);

// DELETE resource
// router.delete('/:id', resourceController.deleteResource);

// UPVOTE resource
router.patch('/:id/upvote', resourceController.upvoteResource);

// POST /api/resources/:id/report        — student: submit a report
router.post('/:id/report', resourceController.reportResource);

// PUT  /api/resources/:id/resolve-report — admin: dismiss / resolve report
router.put('/:id/resolve-report', resourceController.resolveResourceReport);

// DELETE /api/resources/:id             — admin: remove resource
router.delete('/:id', resourceController.deleteResource);

router.post('/:id/upvote', resourceController.upvoteResource);


module.exports = router;