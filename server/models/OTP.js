const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    type: { type: String, enum: ['registration', 'password_reset'], default: 'registration' },
    expiresAt: { type: Date, required: true },
    userData: {
        name: { type: String },
        password: { type: String },
        phone: String,
        role: { type: String, default: 'user' }
    },
    createdAt: { type: Date, default: Date.now }
});

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;
