const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const OTP = require('./models/OTP'); // Import OTP model for cleanup task

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:5173',
  'http://localhost:5174',
  /\.vercel\.app$/ // Allow Vercel preview/production domains
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.some(pattern => pattern instanceof RegExp && pattern.test(origin))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

app.get('/api/auth/cleanup', async (req, res) => {
  try {
    const result = await OTP.deleteMany({ expiresAt: { $lt: new Date() } });
    res.json({ message: `Cleaned up ${result.deletedCount} expired OTPs` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/cars', require('./routes/carRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Note: Cleanup is now handled via the /api/auth/cleanup endpoint
// which can be triggered by a Vercel Cron Job.

const PORT = process.env.PORT || 5000;

// Export for Vercel serverless function
module.exports = app;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
