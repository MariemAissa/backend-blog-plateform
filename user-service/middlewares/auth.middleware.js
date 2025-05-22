const jwt = require('jsonwebtoken');

exports.authMiddleware = (roles = []) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);

        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) return res.sendStatus(403);
            if (roles.length && !roles.includes(user.role)) return res.sendStatus(403);

            req.user = user;
            next();
        });
    };
};


