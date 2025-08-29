const express = require('express');

const { authenticate } = require('../middleware/auth');
const authController= require('../controllers/authController');

const router = express.Router();

// Register
router.post('/register', authController.register);

// Login
router.post('/login', authController.login );

// Get current user
router.get('/me', authenticate, (req, res) => {
  return res.json({ user: req.user });
});

module.exports = router;