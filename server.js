const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000', // ✅ Fixed: was invalid syntax
  credentials: true
}));
app.use(express.json());

// ── MongoDB ──────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// ── Schemas ──────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  name:     { type: String, required: true, trim: true }
}, { timestamps: true });

const bookingSchema = new mongoose.Schema({
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  vendorId:       { type: String },
  vendorName:     { type: String, required: true },
  vendorCategory: { type: String, required: true },
  price:          { type: String, required: true },
  status:         { type: String, default: 'Active' }
}, { timestamps: true });

const reviewSchema = new mongoose.Schema({
  vendorId: { type: String, required: true, index: true },
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:     { type: String, required: true },
  rating:   { type: Number, required: true, min: 1, max: 5 },
  comment:  { type: String, required: true }
}, { timestamps: true });

const messageSchema = new mongoose.Schema({
  vendorId:      { type: String, required: true, index: true },
  userId:        { type: String, required: true, index: true },
  message:       { type: String, required: true },
  eventName:     { type: String },
  status:        { type: String, default: 'sent' },
  isAutoResponse:{ type: Boolean, default: false }
}, { timestamps: true });

const User    = mongoose.model('User',    userSchema);
const Booking = mongoose.model('Booking', bookingSchema);
const Review  = mongoose.model('Review',  reviewSchema);
const Message = mongoose.model('Message', messageSchema);

// ── Static Vendor Data ───────────────────────────────────────────────────────
const vendors = [
  { _id: '1', name: "Gourmet Delights Catering",  description: "Premium catering services",  category: "catering",    eventTypes: ["wedding", "birthday"], rating: 4.8, priceRange: "₹50,000",  reviews: [] },
  { _id: '4', name: "Elegant Events Decor",        description: "Decoration solutions",        category: "decoration",  eventTypes: ["wedding"],             rating: 4.9, priceRange: "₹20,000",  reviews: [] },
  { _id: '7', name: "Grand Ballroom Events",       description: "Luxurious ballrooms",         category: "venue",       eventTypes: ["wedding"],             rating: 4.8, priceRange: "₹200,000", reviews: [] }
];

// ── Helpers ──────────────────────────────────────────────────────────────────
const getVendorWithReviews = async (vendor) => {
  const storedReviews = await Review.find({ vendorId: vendor._id }).sort({ createdAt: -1 });
  const allReviews    = [...storedReviews, ...(vendor.reviews || [])];
  const totalRating   = allReviews.reduce((sum, r) => sum + Number(r.rating || 0), 0);
  const rating        = allReviews.length > 0
    ? Number((totalRating / allReviews.length).toFixed(1))
    : vendor.rating;
  return { ...vendor, reviews: allReviews, rating };
};

// ── Auth Middleware ──────────────────────────────────────────────────────────
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// ── Auth Routes ──────────────────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name)
      return res.status(400).json({ message: 'All fields are required' });

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser    = await User.findOne({ email: normalizedEmail });
    if (existingUser)
      return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email: normalizedEmail, password: hashedPassword, name });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }   // ✅ Fixed: token now expires
    );

    res.status(201).json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'All fields are required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }   // ✅ Fixed: token now expires
    );

    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ✅ Added: profile route (was called in App.js but missing from server)
app.get('/api/auth/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ id: user._id, email: user.email, name: user.name });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// ── Vendor Routes ────────────────────────────────────────────────────────────
app.get('/api/vendors', async (req, res) => {
  try {
    const result = await Promise.all(vendors.map(getVendorWithReviews));
    res.json(result);
  } catch (error) {
    console.error('Vendors error:', error);
    res.status(500).json({ message: 'Error fetching vendors' });
  }
});

// ── Booking Routes ───────────────────────────────────────────────────────────
// ✅ Added: these were missing but Bookings.js page needs them
app.post('/api/bookings', auth, async (req, res) => {
  try {
    const { vendorId, vendorName, vendorCategory, price } = req.body;
    if (!vendorName || !vendorCategory || !price)
      return res.status(400).json({ message: 'Missing required booking fields' });

    const booking = await Booking.create({
      userId: req.user.id,
      vendorId,
      vendorName,
      vendorCategory,
      price
    });
    res.status(201).json(booking);
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: 'Failed to create booking' });
  }
});

app.get('/api/bookings/:userId', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error('Fetch bookings error:', error);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

app.delete('/api/bookings/:bookingId', auth, async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.bookingId);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ message: 'Failed to delete booking' });
  }
});

// ── Message Routes ───────────────────────────────────────────────────────────
app.post('/api/messages/send', async (req, res) => {
  try {
    const { vendorId, userId, message, eventName } = req.body;
    if (!vendorId || !userId || !message)
      return res.status(400).json({ message: 'Missing required fields' });

    const newMessage = await Message.create({ vendorId, userId, message, eventName });
    res.status(201).json({ success: true, messageId: newMessage._id });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

app.get('/api/messages/:userId', async (req, res) => {
  try {
    const userMessages = await Message.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(userMessages);
  } catch (error) {
    console.error('Fetch messages error:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// ── Start Server ─────────────────────────────────────────────────────────────
// ✅ Fixed: always listen — required for Render deployment
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
