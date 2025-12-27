const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const OTP = require('../models/OTP');

// Email configuration
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        ciphers: 'SSLv3'
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        if (user.status !== 'active') {
            return res.status(400).json({ message: 'Your account is not active. Please contact support.' });
        }

        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        if (error.name === 'MongooseError' || error.message.includes('buffering timeout')) {
            return res.status(500).json({
                message: 'Database operation timeout. Please check your internet connection and try again.'
            });
        }
        res.status(500).json({ message: error.message });
    }
});

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone, role = 'user' } = req.body;

        // Validation
        if (!name || name.trim().length < 2 || name.trim().length > 50) {
            return res.status(400).json({ message: 'Name must be between 2 and 50 characters' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please provide a valid email address' });
        }

        if (!password || password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }

        // Password strength: at least one uppercase, one lowercase, one number, one special character
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' });
        }

        if (phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(phone)) {
            return res.status(400).json({ message: 'Please provide a valid phone number' });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Check if there's already an active OTP for this email
        const existingOTP = await OTP.findOne({ email: email.toLowerCase() });
        if (existingOTP && existingOTP.expiresAt > new Date()) {
            return res.status(400).json({ message: 'OTP already sent. Please check your email or wait before requesting a new one.' });
        }

        // Generate OTP
        const otp = crypto.randomInt(100000, 999999).toString();

        // Hash password for temporary storage
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save OTP with user data (expires in 10 minutes)
        const otpDoc = new OTP({
            email: email.toLowerCase(),
            otp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
            userData: {
                name: name.trim(),
                password: hashedPassword,
                phone: phone ? phone.trim() : undefined,
                role
            }
        });

        await otpDoc.save();

        // Send OTP email (or log in test mode)
        if (process.env.USE_TEST_EMAIL === 'true') {
            console.log(`🔍 TEST MODE: OTP for ${email.toLowerCase()} is: ${otp}`);
            console.log('📧 In production, this OTP would be sent via email');
        } else {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email.toLowerCase(),
                subject: 'RentCar - Email Verification OTP',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Welcome to RentCar!</h2>
            <p>Thank you for registering with RentCar. To complete your registration, please use the following OTP:</p>
            <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #1f2937; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
            </div>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you didn't request this registration, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 14px;">Best regards,<br>RentCar Team</p>
          </div>
        `
            };

            await transporter.sendMail(mailOptions);
        }

        res.status(200).json({
            message: 'OTP sent to your email. Please verify to complete registration.',
            email: email.toLowerCase()
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
    }
});

router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        // Find the OTP document
        const otpDoc = await OTP.findOne({
            email: email.toLowerCase(),
            otp,
            expiresAt: { $gt: new Date() }
        });

        if (!otpDoc) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Create the user account
        const user = new User({
            name: otpDoc.userData.name,
            email: otpDoc.email,
            password: otpDoc.userData.password,
            phone: otpDoc.userData.phone,
            role: otpDoc.userData.role
        });

        await user.save();

        // Delete the OTP document
        await OTP.deleteOne({ _id: otpDoc._id });

        res.status(201).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({ message: 'Failed to verify OTP. Please try again.' });
    }
});

router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please provide a valid email address' });
        }

        // Check if user exists
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ message: 'No account found with this email address' });
        }

        // Check if there's already an active password reset OTP for this email
        const existingOTP = await OTP.findOne({
            email: email.toLowerCase(),
            type: 'password_reset',
            expiresAt: { $gt: new Date() }
        });
        if (existingOTP) {
            return res.status(400).json({ message: 'Password reset OTP already sent. Please check your email or wait before requesting a new one.' });
        }

        // Generate OTP
        const otp = crypto.randomInt(100000, 999999).toString();

        // Save OTP for password reset
        const otpDoc = new OTP({
            email: email.toLowerCase(),
            otp,
            type: 'password_reset',
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        });

        await otpDoc.save();

        // Send OTP email
        if (process.env.USE_TEST_EMAIL === 'true') {
            console.log(`🔍 TEST MODE: Password reset OTP for ${email.toLowerCase()} is: ${otp}`);
            console.log('📧 In production, this OTP would be sent via email');
        } else {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email.toLowerCase(),
                subject: 'RentCar - Password Reset OTP',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Password Reset Request</h2>
            <p>You requested a password reset for your RentCar account. Use the following OTP to reset your password:</p>
            <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #1f2937; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
            </div>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 14px;">Best regards,<br>RentCar Team</p>
          </div>
        `
            };

            await transporter.sendMail(mailOptions);
        }

        res.status(200).json({
            message: 'Password reset OTP sent to your email. Please verify to reset your password.',
            email: email.toLowerCase()
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Failed to send password reset OTP. Please try again.' });
    }
});

router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: 'Email, OTP, and new password are required' });
        }

        // Password validation
        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({ message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' });
        }

        // Find the password reset OTP document
        const otpDoc = await OTP.findOne({
            email: email.toLowerCase(),
            otp,
            type: 'password_reset',
            expiresAt: { $gt: new Date() }
        });

        if (!otpDoc) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Find and update the user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        // Delete the OTP document
        await OTP.deleteOne({ _id: otpDoc._id });

        res.status(200).json({
            message: 'Password reset successfully. You can now log in with your new password.'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Failed to reset password. Please try again.' });
    }
});

module.exports = router;
