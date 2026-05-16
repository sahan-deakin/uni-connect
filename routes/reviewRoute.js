const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/reviewController');
 
// router to get list of reported reviews
router.get('/reported/list', ctrl.getReportedReviews);
 
module.exports = router;
