const express    = require('express');
const multer     = require('multer');
const router     = express.Router();
const controller = require('../controllers/resourceController');
const { requireAuth, requireModerator } = require('../middleware/auth');

