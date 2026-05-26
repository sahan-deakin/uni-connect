const express = require('express');

const router = express.Router();

const resourceController = require('../controllers/resourceController');

// GET all resources
router.get('/', resourceController.getAllResources);

// GET single resource
router.get('/:id', resourceController.getResourceById);

// CREATE resource
router.post('/', resourceController.createResource);

// DELETE resource
router.delete('/:id', resourceController.deleteResource);

// UPVOTE resource
router.patch('/:id/upvote', resourceController.upvoteResource);

module.exports = router;