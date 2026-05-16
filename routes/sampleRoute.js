const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/sampleController');

// GET    /api/samples       - list all samples
router.get('/', ctrl.getAll);

// GET    /api/samples/:id   - get one sample
router.get('/:id', ctrl.getById);

// POST   /api/samples       - create a sample
router.post('/', ctrl.create);

// PUT    /api/samples/:id   - update a sample
router.put('/:id', ctrl.update);

// DELETE /api/samples/:id   - delete a sample
router.delete('/:id', ctrl.remove);

module.exports = router;
