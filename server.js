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
  // Catering
  {
    _id: '1',
    name: "Gourmet Delights Catering",
    description: "Premium catering with live counters, multi-cuisine menus, and professional serving staff for all event sizes.",
    category: "catering",
    eventTypes: ["wedding", "birthday", "meeting"],
    rating: 4.8,
    priceRange: "₹40,000-₹80,000",
    contact: "+91 98765 43210",
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=600&auto=format&fit=crop",
    services: ["Multi-cuisine menu", "Live counters", "Serving staff", "Hygiene certified"],
    reviews: []
  },
  {
    _id: '2',
    name: "Spice Symphony Caterers",
    description: "Authentic Indian and continental cuisine specialists with over 15 years of experience in large-scale events.",
    category: "catering",
    eventTypes: ["wedding", "houseparty", "birthday"],
    rating: 4.6,
    priceRange: "₹30,000-₹60,000",
    contact: "+91 91234 56789",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&auto=format&fit=crop",
    services: ["Traditional thali", "Dessert counters", "Jain options", "On-site cooking"],
    reviews: []
  },
  {
    _id: '3',
    name: "Royal Feast Services",
    description: "Luxury catering service specialising in Mughlai, continental and fusion menus for premium weddings and corporate events.",
    category: "catering",
    eventTypes: ["wedding", "meeting"],
    rating: 4.7,
    priceRange: "₹60,000-₹1,20,000",
    contact: "+91 99887 76655",
    image: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600&auto=format&fit=crop",
    services: ["Mughlai cuisine", "Fusion platters", "Private chef", "Cocktail snacks"],
    reviews: []
  },

  // Decoration
  {
    _id: '4',
    name: "Elegant Events Decor",
    description: "Stunning decoration solutions from floral arrangements to theme-based setups tailored for every occasion.",
    category: "decoration",
    eventTypes: ["wedding", "birthday"],
    rating: 4.9,
    priceRange: "₹15,000-₹40,000",
    contact: "+91 98001 12345",
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&auto=format&fit=crop",
    services: ["Theme setup", "Floral styling", "Lighting design", "Stage decor"],
    reviews: []
  },
  {
    _id: '5',
    name: "Dream Decor Studio",
    description: "Creative decoration studio offering balloon art, photo booths, LED setups and custom backdrops for all events.",
    category: "decoration",
    eventTypes: ["birthday", "houseparty", "wedding"],
    rating: 4.7,
    priceRange: "₹10,000-₹30,000",
    contact: "+91 90000 55566",
    image: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=600&auto=format&fit=crop",
    services: ["Balloon art", "Photo booths", "LED walls", "Custom backdrops"],
    reviews: []
  },
  {
    _id: '6',
    name: "Blossom & Bloom Decor",
    description: "Specialised floral decoration service for weddings and intimate gatherings with fresh and artificial flower arrangements.",
    category: "decoration",
    eventTypes: ["wedding", "meeting"],
    rating: 4.8,
    priceRange: "₹20,000-₹50,000",
    contact: "+91 87654 32109",
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&auto=format&fit=crop",
    services: ["Fresh floral arches", "Centrepieces", "Aisle decor", "Entrance decoration"],
    reviews: []
  },

  // Venue
  {
    _id: '7',
    name: "Grand Ballroom Events",
    description: "Luxurious ballroom venue with state-of-the-art sound, lighting and catering infrastructure for up to 1000 guests.",
    category: "venue",
    eventTypes: ["wedding", "meeting"],
    rating: 4.8,
    priceRange: "₹1,50,000-₹3,00,000",
    contact: "+91 98100 77788",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&auto=format&fit=crop",
    services: ["Event space", "Parking support", "Power backup", "Guest seating"],
    reviews: []
  },
  {
    _id: '8',
    name: "The Garden Retreat",
    description: "Beautiful outdoor garden venue perfect for intimate weddings, birthdays and house parties with natural surroundings.",
    category: "venue",
    eventTypes: ["wedding", "birthday", "houseparty"],
    rating: 4.6,
    priceRange: "₹50,000-₹1,20,000",
    contact: "+91 92233 44556",
    image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&auto=format&fit=crop",
    services: ["Open garden", "Lawn seating", "Natural lighting", "Indoor backup"],
    reviews: []
  },
  {
    _id: '9',
    name: "Skyline Convention Centre",
    description: "Modern convention centre with multiple halls, AV equipment and professional event management support for corporate events.",
    category: "venue",
    eventTypes: ["meeting", "wedding"],
    rating: 4.7,
    priceRange: "₹80,000-₹2,00,000",
    contact: "+91 95544 33221",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop",
    services: ["Multiple halls", "AV equipment", "Wi-Fi", "Valet parking"],
    reviews: []
  }
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
