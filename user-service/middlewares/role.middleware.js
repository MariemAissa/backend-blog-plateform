// middleware/authRole.js
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

function authRole(allowedRoles) {
    return async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('fdf',decoded)

            const user = await User.findById(decoded.id);
            if (!user) return res.status(401).json({ message: 'User not found' });

            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
            }

            req.user = user;
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Invalid token' });
        }
    };
}

module.exports = authRole;
