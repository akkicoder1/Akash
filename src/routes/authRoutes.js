const express = require('express');
const { signupHandler, loginHandler, meHandler } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/signup', signupHandler);
router.post('/login', loginHandler);
router.get('/me', requireAuth, meHandler);

module.exports = router;
