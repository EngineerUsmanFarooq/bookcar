const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    phone: String,
    joinDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
