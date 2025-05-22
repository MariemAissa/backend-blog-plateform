const User = require('../models/user.model');

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
    const users = await User.find().select('-password -refreshToken');
    res.json(users);
};

// Change role (admin only)
exports.updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'editor', 'writer', 'reader'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
};
