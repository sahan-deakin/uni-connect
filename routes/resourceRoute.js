const express = require('express');

const router = express.Router();

const resourceController = require('../controllers/resourceController');

const upload = require('../middleware/uploadMiddleware');

// GET all resources
router.get('/', resourceController.getAllResources);

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

// GET  /api/resources/reported          — admin: list reported resources
router.get('/reported', resourceController.getReportedResources);

// POST /api/resources/:id/report        — student: submit a report
router.post('/:id/report', resourceController.reportResource);

// PUT  /api/resources/:id/resolve-report — admin: dismiss / resolve report
router.put('/:id/resolve-report', resourceController.resolveResourceReport);

// DELETE /api/resources/:id             — admin: remove resource
router.delete('/:id', resourceController.deleteResource);


module.exports = router;