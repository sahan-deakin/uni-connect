const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/resourceController');

// GET  /api/resources/reported          — admin: list reported resources
router.get('/reported', ctrl.getReportedResources);

// POST /api/resources/:id/report        — student: submit a report
router.post('/:id/report', ctrl.reportResource);

// PUT  /api/resources/:id/resolve-report — admin: dismiss / resolve report
router.put('/:id/resolve-report', ctrl.resolveResourceReport);

// DELETE /api/resources/:id             — admin: remove resource
router.delete('/:id', ctrl.deleteResource);

module.exports = router;
