const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: { type: String },
    role: { type: String, enum: ['admin', 'editor', 'writer', 'reader'], default: 'reader' },
    refreshToken: { type: String }
});

// Hash before save
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare password
UserSchema.methods.comparePassword = function (pwd) {
    return bcrypt.compare(pwd, this.password);
};

module.exports = mongoose.model('User', UserSchema);
