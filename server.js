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

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    vendorId: { type: String },
    vendorName: { type: String, required: true },
    vendorCategory: { type: String, required: true },
    price: { type: String, required: true },
    status: { type: String, default: 'Active' }
  },
  { timestamps: true }
);

const reviewSchema = new mongoose.Schema(
  {
    vendorId: { type: String, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
const Booking = mongoose.model('Booking', bookingSchema);
const Review = mongoose.model('Review', reviewSchema);

let vendors = [
  // Catering
  { _id: '1', name: "Gourmet Delights Catering", description: "Premium catering services for all occasions", contact: "+91-9876543210", rating: 4.8, priceRange: "₹50,000 - ₹500,000", category: "catering", eventTypes: ["wedding", "birthday", "meeting", "houseparty", "custom"], image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=500&q=80", services: ["Multi-cuisine buffet", "Live chaat counters", "Dessert studio", "Uniformed serving staff"], reviews: [{ name: "Sneha R.", rating: 5, comment: "Excellent taste and premium service for our wedding." }, { name: "Karan V.", rating: 4, comment: "Well-managed setup and punctual team." }] },
  { _id: '2', name: "Traditional Flavors", description: "Authentic regional cuisine specialists", contact: "+91-9876543211", rating: 4.6, priceRange: "₹30,000 - ₹300,000", category: "catering", eventTypes: ["wedding", "birthday", "meeting", "houseparty", "custom"], image: "https://images.unsplash.com/photo-1547573854-74d2a71d0826?w=500&q=80", services: ["South Indian menu", "North Indian thali", "Festival specials", "Banana leaf service"], reviews: [{ name: "Pratik S.", rating: 5, comment: "Authentic flavors and guests loved the food." }, { name: "Mitali P.", rating: 4, comment: "Good quality and polite staff." }] },
  { _id: '3', name: "Fusion Feast", description: "Modern fusion cuisine with traditional twist", contact: "+91-9876543212", rating: 4.7, priceRange: "₹40,000 - ₹400,000", category: "catering", eventTypes: ["wedding", "birthday", "meeting", "houseparty", "custom"], image: "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=500&q=80", services: ["Indo-continental platters", "Cocktail snacks", "Interactive food stations", "Corporate meal boxes"], reviews: [{ name: "Aayush G.", rating: 5, comment: "Creative menu and stylish presentation." }, { name: "Neha T.", rating: 4, comment: "Fusion items were unique and tasty." }] },

  // Decoration
  { _id: '4', name: "Elegant Events Decor", description: "Complete decoration solutions for weddings and parties", contact: "+91-9876543213", rating: 4.9, priceRange: "₹20,000 - ₹200,000", category: "decoration", eventTypes: ["wedding", "birthday", "meeting", "houseparty", "custom"], image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=500&q=80", services: ["Mandap decor", "Entry arch setup", "Stage backdrop", "Ambient lighting"], reviews: [{ name: "Ritika N.", rating: 5, comment: "Decoration looked luxurious and elegant." }, { name: "Dev M.", rating: 5, comment: "Great attention to detail and finishing." }] },
  { _id: '5', name: "Creative Designs", description: "Themed decorations and custom setups", contact: "+91-9876543214", rating: 4.5, priceRange: "₹15,000 - ₹150,000", category: "decoration", eventTypes: ["wedding", "birthday", "meeting", "houseparty", "custom"], image: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=500&q=80", services: ["Custom theme concepts", "Photo booth corners", "Balloon artistry", "Kids party setups"], reviews: [{ name: "Sonal K.", rating: 4, comment: "Theme was exactly as discussed." }, { name: "Rohit B.", rating: 5, comment: "Creative team with fast execution." }] },
  { _id: '6', name: "Floral Fantasy", description: "Beautiful floral arrangements and decor", contact: "+91-9876543215", rating: 4.7, priceRange: "₹10,000 - ₹100,000", category: "decoration", eventTypes: ["wedding", "birthday", "meeting", "houseparty", "custom"], image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=500&q=80", services: ["Fresh flower walls", "Table centerpieces", "Bridal bouquet", "Aisle floral styling"], reviews: [{ name: "Pooja L.", rating: 5, comment: "Fresh flowers and beautiful color palette." }, { name: "Ishaan D.", rating: 4, comment: "Very good floral combinations and setup." }] },

  // Venue
  { _id: '7', name: "Grand Ballroom Events", description: "Luxurious ballrooms and event spaces", contact: "+91-9876543216", rating: 4.8, priceRange: "₹200,000 - ₹2,000,000", category: "venue", eventTypes: ["wedding", "birthday", "meeting", "houseparty", "custom"], image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=500&q=80", services: ["AC banquet halls", "Valet parking", "In-house AV support", "Bridal suite"], reviews: [{ name: "Akanksha J.", rating: 5, comment: "Premium venue and excellent hospitality team." }, { name: "Vivek H.", rating: 4, comment: "Spacious hall and smooth event flow." }] },
  { _id: '8', name: "Garden Paradise", description: "Beautiful outdoor venues with natural settings", contact: "+91-9876543217", rating: 4.6, priceRange: "₹100,000 - ₹1,000,000", category: "venue", eventTypes: ["wedding", "birthday", "meeting", "houseparty", "custom"], image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500&q=80", services: ["Lawn venue access", "Outdoor stage", "Rain backup arrangements", "Decor tie-ups"], reviews: [{ name: "Harshita C.", rating: 5, comment: "Perfect outdoor vibe for evening functions." }, { name: "Nakul A.", rating: 4, comment: "Nice ambience and responsive management." }] },
  { _id: '9', name: "Urban Chic Halls", description: "Modern urban venues for contemporary events", contact: "+91-9876543218", rating: 4.7, priceRange: "₹150,000 - ₹1,500,000", category: "venue", eventTypes: ["wedding", "birthday", "meeting", "houseparty", "custom"], image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80", services: ["Contemporary banquet design", "Conference-ready setup", "Premium lighting", "Dedicated event coordinator"], reviews: [{ name: "Shreya M.", rating: 5, comment: "Modern interiors and excellent service quality." }, { name: "Raghav E.", rating: 4, comment: "Great central location and clean facilities." }] },
];

const findVendorForBooking = (booking) =>
  vendors.find(vendor => vendor._id === booking.vendorId) ||
  vendors.find(vendor => vendor.name === booking.vendorName);

const getVendorWithReviews = async (vendor) => {
  const storedReviews = await Review.find({ vendorId: vendor._id }).sort({ createdAt: -1 });
  const reviews = [
    ...storedReviews.map((review) => ({
      name: review.name,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt
    })),
    ...(vendor.reviews || [])
  ];

  const totalRating = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
  const rating = reviews.length > 0
    ? Number((totalRating / reviews.length).toFixed(1))
    : vendor.rating;

  return { ...vendor, reviews, rating };
};

// Auth middleware
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required' });
    }

    const normalizedEmail = String(email || '').trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      email: normalizedEmail,
      password: hashedPassword,
      name
    });

    const token = jwt.sign({ id: user._id.toString(), email: user.email }, process.env.JWT_SECRET || 'your-secret-key');
    res.json({ token, user: { id: user._id.toString(), email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = String(email || '').trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id.toString(), email: user.email }, process.env.JWT_SECRET || 'your-secret-key');
    res.json({ token, user: { id: user._id.toString(), email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/auth/profile', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    createdAt: user.createdAt
  });
});

// Bookings routes
app.post('/api/bookings', auth, async (req, res) => {
  try {
    const { items, totalAmount, paymentMethod } = req.body;
    const userId = req.user.id;
    const bookings = [];
    
    for (const item of items) {
      const booking = await Booking.create({
        userId,
        vendorId: item._id,
        vendorName: item.name,
        vendorCategory: item.category,
        price: item.priceRange,
        status: 'Active'
      });
      bookings.push({ id: booking._id.toString(), userId, vendorId: item._id, vendorName: item.name, totalAmount, paymentMethod });
    }
    
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create booking' });
  }
});

app.get('/api/bookings', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await Booking.find({ userId }).sort({ createdAt: -1 });
    const bookingsWithVendors = await Promise.all(
      bookings.map(async (booking) => {
        const vendor = findVendorForBooking(booking);
        const vendorWithReviews = vendor ? await getVendorWithReviews(vendor) : null;

        return {
          id: booking._id.toString(),
          userId: booking.userId.toString(),
          vendorId: booking.vendorId || vendor?._id,
          vendorName: booking.vendorName,
          vendorCategory: booking.vendorCategory,
          price: booking.price,
          status: booking.status,
          createdAt: booking.createdAt,
          vendor: vendorWithReviews
        };
      })
    );

    res.json(bookingsWithVendors);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/bookings/:id/reviews', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { rating, comment } = req.body;
    const numericRating = Number(rating);
    const trimmedComment = String(comment || '').trim();

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: 'Rating must be a whole number between 1 and 5' });
    }

    if (!trimmedComment) {
      return res.status(400).json({ message: 'Comment is required' });
    }

    const booking = await Booking.findOne({ _id: req.params.id, userId });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const vendor = findVendorForBooking(booking);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found for this booking' });

    const user = await User.findById(req.user.id).select('name');
    await Review.create({
      vendorId: vendor._id,
      userId,
      name: user?.name || req.user.email || 'Customer',
      rating: numericRating,
      comment: trimmedComment
    });

    const vendorWithReviews = await getVendorWithReviews(vendor);
    res.json({ success: true, vendor: vendorWithReviews });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit review' });
  }
});

app.delete('/api/bookings/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = await Booking.findOne({ _id: req.params.id, userId });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    await Booking.deleteOne({ _id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Vendor routes
app.get('/api/vendors', async (req, res) => {
  res.json(await Promise.all(vendors.map(getVendorWithReviews)));
});

app.get('/api/vendors/:category', async (req, res) => {
  const categoryVendors = vendors.filter(vendor => vendor.category === req.params.category);
  res.json(await Promise.all(categoryVendors.map(getVendorWithReviews)));
});

app.post('/api/vendors/recommend', async (req, res) => {
   const { eventType } = req.body;
   const recommendedVendors = vendors.filter(vendor =>
     vendor.eventTypes.includes(eventType)
   );
   res.json(await Promise.all(recommendedVendors.map(getVendorWithReviews)));
});

app.post('/api/vendors/:id/reviews', auth, async (req, res) => {
   try {
     const { rating, comment } = req.body;
     const numericRating = Number(rating);
     const trimmedComment = String(comment || '').trim();

     if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
       return res.status(400).json({ message: 'Rating must be a whole number between 1 and 5' });
     }

     if (!trimmedComment) {
       return res.status(400).json({ message: 'Comment is required' });
     }

     const vendor = vendors.find(v => v._id === req.params.id);
     if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

     const user = await User.findById(req.user.id).select('name');
     await Review.create({
       vendorId: vendor._id,
       userId: req.user.id,
       name: user?.name || req.user.email || 'Customer',
       rating: numericRating,
       comment: trimmedComment
     });

     const vendorWithReviews = await getVendorWithReviews(vendor);

     res.json({ success: true, vendor: vendorWithReviews });
   } catch (err) {
     res.status(500).json({ message: 'Failed to submit review' });
   }
});

// Messages storage (in-memory for demo)
let messages = [];

// Message routes
app.post('/api/messages/send', (req, res) => {
   try {
     const { vendorId, userId, message, eventName } = req.body;

     const newMessage = {
       id: Date.now().toString(),
       vendorId,
       userId,
       message,
       eventName,
       timestamp: new Date(),
       status: 'sent'
     };

     messages.push(newMessage);

     // Find vendor for response
     const vendor = vendors.find(v => v._id === vendorId);
     if (vendor) {
       // Simulate vendor auto-response
       setTimeout(() => {
         const autoResponse = {
           id: Date.now().toString() + '_response',
           vendorId,
           userId,
           message: `Thank you for your message regarding "${eventName}". We will get back to you soon!`,
           eventName,
           timestamp: new Date(),
           status: 'received',
           isAutoResponse: true
         };
         messages.push(autoResponse);
       }, 1000);
     }

     res.json({ success: true, messageId: newMessage.id });
   } catch (error) {
     console.error('Error sending message:', error);
     res.status(500).json({ message: 'Failed to send message' });
   }
});

app.get('/api/messages/:userId', (req, res) => {
   const userMessages = messages.filter(msg => msg.userId === req.params.userId);
   res.json(userMessages);
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });
