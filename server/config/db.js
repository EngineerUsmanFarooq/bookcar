const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log('Connected to MongoDB');

        // Initialize admin user after successful connection
        try {
            const adminExists = await User.findOne({ role: 'admin' });
            if (!adminExists) {
                const hashedPassword = await bcrypt.hash('Admin@1234', 10);
                const admin = new User({
                    name: 'Admin',
                    email: 'Admin123@gmail.com',
                    password: hashedPassword,
                    role: 'admin',
                    status: 'active'
                });
                await admin.save();
                console.log('Default admin user created: Admin123@gmail.com / Admin@1234');
            }
        } catch (error) {
            console.error('Error creating admin user:', error);
        }
    } catch (err) {
        console.error('MongoDB connection error:', err);
        console.error('Please check:');
        console.error('1. MongoDB Atlas cluster is not paused');
        console.error('2. Network connectivity');
        console.error('3. IP whitelist allows your connection');
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;
