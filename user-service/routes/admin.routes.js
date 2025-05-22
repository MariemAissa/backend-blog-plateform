// routes/admin.js
const express = require('express');
const router = express.Router();
const authRole = require('../middlewares/role.middleware');
const User = require('../models/user.model');

router.get('/all', authRole(['admin']), async (req, res) => {
    // Exemple : retourner la liste des utilisateurs avec leurs rôles
    const users = await User.find({}, 'username role');
    res.json(users);
});

router.post('/add/:userId', authRole(['admin']), async (req, res) => {
    // Modifier le rôle d'un utilisateur (par admin)
    const { role } = req.body;
    const allowedRoles = ['admin', 'editor', 'writer', 'reader'];

    if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await UserActivation.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = role;
    await user.save();
    res.json({ message: 'Role updated', user });
});

module.exports = router;
