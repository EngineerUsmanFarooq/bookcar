const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/activate', async (req, res) => {
    try {
        const admin = await User.findOne({ email: 'admin@rentcar.com' });
        if (!admin) {
            return res.status(404).json({ message: 'Admin account not found' });
        }

        admin.status = 'active';
        await admin.save();

        res.json({
            message: 'Admin account activated successfully',
            user: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                status: admin.status
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
