const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/event-planner';

// DB Connection Utility for Serverless
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
  }
};

// Ensure DB is connected for every request
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Schemas
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  name: { type: String, required: true, trim: true }
}, { timestamps: true });

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  vendorId: { type: String },
  vendorName: { type: String, required: true },
  vendorCategory: { type: String, required: true },
  price: { type: String, required: true },
  status: { type: String, default: 'Active' }
}, { timestamps: true });

const reviewSchema = new mongoose.Schema({
  vendorId: { type: String, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true }
}, { timestamps: true });

const messageSchema = new mongoose.Schema({
  vendorId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  message: { type: String, required: true },
  eventName: { type: String },
  status: { type: String, default: 'sent' },
  isAutoResponse: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Booking = mongoose.model('Booking', bookingSchema);
const Review = mongoose.model('Review', reviewSchema);
const Message = mongoose.model('Message', messageSchema);

// Static Vendor Data
let vendors = [
  { _id: '1', name: "Gourmet Delights Catering", description: "Premium catering services", category: "catering", eventTypes: ["wedding", "birthday"], rating: 4.8, priceRange: "₹50,000", reviews: [] },
  { _id: '4', name: "Elegant Events Decor", description: "Decoration solutions", category: "decoration", eventTypes: ["wedding"], rating: 4.9, priceRange: "₹20,000", reviews: [] },
  { _id: '7', name: "Grand Ballroom Events", description: "Luxurious ballrooms", category: "venue", eventTypes: ["wedding"], rating: 4.8, priceRange: "₹200,000", reviews: [] }
];

// Helper Functions
const findVendorForBooking = (booking) => 
  vendors.find(v => v._id === booking.vendorId) || vendors.find(v => v.name === booking.vendorName);

const getVendorWithReviews = async (vendor) => {
  const storedReviews = await Review.find({ vendorId: vendor._id }).sort({ createdAt: -1 });
  const allReviews = [...storedReviews, ...(vendor.reviews || [])];
  const totalRating = allReviews.reduce((sum, r) => sum + Number(r.rating || 0), 0);
  const rating = allReviews.length > 0 ? Number((totalRating / allReviews.length).toFixed(1)) : vendor.rating;
  return { ...vendor, reviews: allReviews, rating };
};

// Auth Middleware
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Routes
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) return res.status(400).json({ message: 'User exists' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ email: normalizedEmail, password: hashedPassword, name });
  const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'fallback-secret');
  res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'fallback-secret');
  res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
});

app.get('/api/vendors', async (req, res) => {
  const result = await Promise.all(vendors.map(getVendorWithReviews));
  res.json(result);
});

app.post('/api/messages/send', async (req, res) => {
  try {
    const { vendorId, userId, message, eventName } = req.body;
    const newMessage = await Message.create({ vendorId, userId, message, eventName });
    res.json({ success: true, messageId: newMessage._id });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send' });
  }
});

app.get('/api/messages/:userId', async (req, res) => {
  try {
    const userMessages = await Message.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(userMessages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// Final Export for Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server on ${PORT}`));
}
module.exports = app;
