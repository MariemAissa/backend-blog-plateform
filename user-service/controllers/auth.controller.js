const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');

exports.register = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json({ message: 'User registered' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
        return res.status(401).json({ message: 'Invalid credentials' });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
        path: '/api/auth/refresh-token'
    });

    res.json({ accessToken, role: user.role });
};

exports.refreshToken = async (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) return res.sendStatus(401);

    try {
        const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(payload.id);
        if (!user || user.refreshToken !== token) return res.sendStatus(403);

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        user.refreshToken = newRefreshToken;
        await user.save();

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: false,
            path: '/api/auth/refresh-token'
        });

        res.json({ accessToken: newAccessToken });
    } catch (err) {
        res.sendStatus(403);
    }
};

exports.logout = async (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) return res.sendStatus(204);
    const user = await User.findOne({ refreshToken: token });
    if (user) {
        user.refreshToken = null;
        await user.save();
    }
    res.clearCookie('refreshToken', { path: '/api/auth/refresh-token' });
    res.sendStatus(204);
};
