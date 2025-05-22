const jwt = require('jsonwebtoken');

exports.authenticate = (roles = []) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });

        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Forbidden' });
            if (roles.length && !roles.includes(decoded.role)) return res.status(403).json({ message: 'Role not allowed' });

            req.user = decoded;
            next();
        });
    };
};

exports.authorize = (allowedRoles = []) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
        }
        next();
    };
};
