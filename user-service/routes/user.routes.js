const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

// Admin routes
router.get('/', authMiddleware(['admin']), userCtrl.getAllUsers);
router.put('/:id/role', authMiddleware(['admin']), userCtrl.updateUserRole);

module.exports = router;
