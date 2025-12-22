const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config();


const app = express();
// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

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

// Cleanup expired OTPs every 5 minutes
setInterval(async () => {
  try {
    const result = await OTP.deleteMany({ expiresAt: { $lt: new Date() } });
    if (result.deletedCount > 0) {
      console.log(`Cleaned up ${result.deletedCount} expired OTPs`);
    }
  } catch (error) {
    console.error('Error cleaning up expired OTPs:', error);
  }
}, 5 * 60 * 1000); // 5 minutes

// Serve static files from the frontend build directory
const frontendPath = path.join(__dirname, '../frontend/dist');

if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
} else {
  console.log('⚠️  Frontend dist directory not found. Please run "npm run build" in the frontend directory.');
  console.log('📁 Expected path:', frontendPath);
}




// keep your MongoDB URI secure and do not expose it in public repositories
// MongoDB connection here you should change the URI to your MongoDB connection string

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(async () => {
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
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  console.error('Please check:');
  console.error('1. MongoDB Atlas cluster is not paused');
  console.error('2. Network connectivity');
  console.error('3. IP whitelist allows your connection');
});

// Schemas
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  phone: String,
  joinDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' }
});

const carSchema = new mongoose.Schema({
  name: { type: String, required: true },
  model: { type: String, required: true },
  image: { type: String, required: true },
  pricePerHour: { type: Number, required: true },
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  available: { type: Number, required: true },
  category: { type: String, required: true },
  transmission: { type: String, required: true },
  seats: { type: Number, required: true },
  features: [String]
});

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  needDriver: { type: Boolean, default: false },
  driverContact: { type: String },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['welcome', 'promotion', 'info', 'warning'], default: 'info' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

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

// Models
const User = mongoose.model('User', userSchema);
const Car = mongoose.model('Car', carSchema);
const Booking = mongoose.model('Booking', bookingSchema);
const Notification = mongoose.model('Notification', notificationSchema);
const OTP = mongoose.model('OTP', otpSchema);

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({
        message: 'Database connection error. Please try again later.'
      });
    }

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

app.post('/api/auth/register', async (req, res) => {
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

// OTP verification endpoint
app.post('/api/auth/verify-otp', async (req, res) => {
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

// Forgot password endpoint
app.post('/api/auth/forgot-password', async (req, res) => {
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

// Reset password endpoint
app.post('/api/auth/reset-password', async (req, res) => {
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

// Car routes
app.get('/api/cars', async (req, res) => {
  try {
    const cars = await Car.find();
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/cars/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.json(car);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/cars', async (req, res) => {
  try {
    const car = new Car(req.body);
    await car.save();
    res.status(201).json(car);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/cars/:id', async (req, res) => {
  try {
    const car = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(car);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/cars/:id', async (req, res) => {
  try {
    await Car.findByIdAndDelete(req.params.id);
    res.json({ message: 'Car deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Booking routes
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().populate('carId').populate('userId');
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

app.get('/api/bookings/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await Booking.find({ userId }).populate('carId').populate('userId');
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ message: 'Error fetching user bookings' });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const { userId, carId, startDate, endDate, startTime, endTime, totalAmount, needDriver, driverContact } = req.body;

    // Validate car availability
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    if (car.available <= 0) {
      return res.status(400).json({ message: 'Car is not available for booking' });
    }

    // Create booking
    const booking = new Booking({
      userId,
      carId,
      startDate,
      endDate,
      startTime,
      endTime,
      totalAmount,
      needDriver,
      driverContact,
      status: 'pending'
    });

    await booking.save();

    // Update car availability
    car.available -= 1;
    await car.save();

    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Error creating booking' });
  }
});

app.get('/api/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('carId').populate('userId');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Error fetching booking' });
  }
});

app.put('/api/bookings/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;
    await booking.save();

    // If booking is cancelled, update car availability
    if (status === 'cancelled') {
      const car = await Car.findById(booking.carId);
      if (car) {
        car.available += 1;
        await car.save();
      }
    }

    res.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ message: 'Error updating booking' });
  }
});

// User management routes
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Notification routes
app.get('/api/notifications/:userId', async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/notifications', async (req, res) => {
  try {
    const { userId, title, message, type } = req.body;
    const notification = new Notification({
      userId,
      title,
      message,
      type: type || 'info'
    });
    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin management routes
app.post('/api/admin/activate', async (req, res) => {
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

// Specific route for admin page
app.get('/admin', (req, res) => {
  const indexPath = path.join(__dirname, '../frontend/dist/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({
      message: 'Admin Dashboard Not Available',
      error: 'Frontend application is not built',
      solution: 'To access the admin dashboard:',
      steps: [
        '1. Open terminal in the frontend directory',
        '2. Run: npm run build',
        '3. Restart the server',
        '4. Try accessing /admin again'
      ],
      adminCredentials: {
        email: 'admin@rentcar.com',
        password: 'admin123'
      }
    });
  }
});

// Catch-all route to serve the frontend application
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API endpoint not found' });
  }
  
  // Check if frontend is built
  const indexPath = path.join(__dirname, '../frontend/dist/index.html');
  if (fs.existsSync(indexPath)) {
    // For all other routes, serve the React app
    res.sendFile(indexPath);
  } else {
    // Frontend not built - provide helpful error message
    res.status(404).json({
      message: 'Frontend not built',
      error: 'The frontend application has not been built yet.',
      solution: 'Please run "npm run build" in the frontend directory, then restart the server.',
      routes: {
        api: '/api/*',
        admin: '/admin (requires frontend build)',
        dashboard: '/dashboard (requires frontend build)'
      }
    });
  }
});



const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
