// routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phoneNumber } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // For admin registration, you might want to add an extra security layer
    if (role === 'admin') {
      // Check for admin registration code or other security measures
      const { adminCode } = req.body;
      if (adminCode !== process.env.ADMIN_REGISTRATION_CODE) {
        return res.status(403).json({ message: 'Invalid admin registration code' });
      }
    }
    
    // Create new user
    const user = new User({
      name,
      email,
      password,
      role: role || 'client',
      phoneNumber
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;

// routes/services.js
const express = require('express');
const router = express.Router();
const { Service } = require('../models');

// Admin middleware for this route
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

// Get all services
router.get('/', async (req, res) => {
  try {
    const services = await Service.find({ isActive: true });
    res.json({ services });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching services', error: error.message });
  }
});

// Get a specific service
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json({ service });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching service', error: error.message });
  }
});

// Create a new service (admin only)
router.post('/', isAdmin, async (req, res) => {
  try {
    const { name, description, price, duration, category, image } = req.body;
    
    const service = new Service({
      name,
      description,
      price,
      duration,
      category,
      image
    });
    
    await service.save();
    res.status(201).json({ message: 'Service created successfully', service });
  } catch (error) {
    res.status(500).json({ message: 'Error creating service', error: error.message });
  }
});

// Update a service (admin only)
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const { name, description, price, duration, category, image, isActive } = req.body;
    
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { name, description, price, duration, category, image, isActive },
      { new: true }
    );
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    res.json({ message: 'Service updated successfully', service });
  } catch (error) {
    res.status(500).json({ message: 'Error updating service', error: error.message });
  }
});

// Delete a service (admin only)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting service', error: error.message });
  }
});

module.exports = router;

// routes/stylists.js
const express = require('express');
const router = express.Router();
const { Stylist } = require('../models');

// Admin middleware for this route
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

// Get all stylists
router.get('/', async (req, res) => {
  try {
    const stylists = await Stylist.find({ isActive: true }).populate('services');
    res.json({ stylists });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stylists', error: error.message });
  }
});

// Get a specific stylist
router.get('/:id', async (req, res) => {
  try {
    const stylist = await Stylist.findById(req.params.id).populate('services');
    if (!stylist) {
      return res.status(404).json({ message: 'Stylist not found' });
    }
    res.json({ stylist });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stylist', error: error.message });
  }
});

// Create a new stylist (admin only)
router.post('/', isAdmin, async (req, res) => {
  try {
    const { name, title, bio, image, email, phoneNumber, services } = req.body;
    
    const stylist = new Stylist({
      name,
      title,
      bio,
      image,
      email,
      phoneNumber,
      services
    });
    
    await stylist.save();
    res.status(201).json({ message: 'Stylist created successfully', stylist });
  } catch (error) {
    res.status(500).json({ message: 'Error creating stylist', error: error.message });
  }
});

// Update a stylist (admin only)
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const { name, title, bio, image, email, phoneNumber, services, rating, isActive } = req.body;
    
    const stylist = await Stylist.findByIdAndUpdate(
      req.params.id,
      { name, title, bio, image, email, phoneNumber, services, rating, isActive },
      { new: true }
    );
    
    if (!stylist) {
      return res.status(404).json({ message: 'Stylist not found' });
    }
    
    res.json({ message: 'Stylist updated successfully', stylist });
  } catch (error) {
    res.status(500).json({ message: 'Error updating stylist', error: error.message });
  }
});

// Delete a stylist (admin only)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const stylist = await Stylist.findByIdAndDelete(req.params.id);
    
    if (!stylist) {
      return res.status(404).json({ message: 'Stylist not found' });
    }
    
    res.json({ message: 'Stylist deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting stylist', error: error.message });
  }
});

module.exports = router;

// routes/bookings.js
const express = require('express');
const router = express.Router();
const { Booking, Stylist, Service } = require('../models');

// Admin middleware for this route
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

// Get all bookings (admin only)
router.get('/', isAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('stylist')
      .populate('service')
      .sort({ date: -1 });
    
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
});

// Get bookings by status (admin only)
router.get('/status/:status', isAdmin, async (req, res) => {
  try {
    const { status } = req.params;
    const bookings = await Booking.find({ status })
      .populate('stylist')
      .populate('service')
      .sort({ date: -1 });
    
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings by status', error: error.message });
  }
});

// Get bookings for a specific date range (admin only)
router.get('/date-range', isAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const bookings = await Booking.find({
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    })
      .populate('stylist')
      .populate('service')
      .sort({ date: 1 });
    
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings by date range', error: error.message });
  }
});

// Get a specific booking
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('stylist')
      .populate('service');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Only admin or the client who made the booking can access it
    if (req.user.role !== 'admin' && 
        booking.client.userId && 
        booking.client.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }
    
    res.json({ booking });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking', error: error.message });
  }
});

// Create a new booking
router.post('/', async (req, res) => {
  try {
    const {
      clientName,
      clientContact,
      clientLocation,
      stylistId,
      serviceId,
      date,
      timeStart,
      timeEnd,
      paymentMethod,
      notes
    } = req.body;
    
    // Verify stylist and service exist
    const stylist = await Stylist.findById(stylistId);
    if (!stylist) {
      return res.status(404).json({ message: 'Stylist not found' });
    }
    
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Create the booking
    const booking = new Booking({
      client: {
        name: clientName,
        contact: clientContact,
        location: clientLocation,
        userId: req.user.id // If booking is made by a logged-in user
      },
      stylist: stylistId,
      service: serviceId,
      date: new Date(date),
      time: {
        start: timeStart,
        end: timeEnd
      },
      paymentMethod,
      notes
    });
    
    await booking.save();
    
    // Send notification to admin (implement this functionality)
    // This could be through email, SMS, or push notification
    
    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating booking', error: error.message });
  }
});

// Update a booking status (admin only)
router.put('/:id/status', isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json({
      message: `Booking status updated to ${status}`,
      booking
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating booking status', error: error.message });
  }
});

// Update payment status (admin only)
router.put('/:id/payment', isAdmin, async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    );
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json({
      message: `Payment status updated to ${paymentStatus}`,
      booking
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating payment status', error: error.message });
  }
});

// Cancel a booking
router.put('/:id/cancel', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user is admin or the booking client
    if (req.user.role !== 'admin' && 
        booking.client.userId && 
        booking.client.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }
    
    // Update booking status
    booking.status = 'cancelled';
    await booking.save();
    
    res.json({
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling booking', error: error.message });
  }
});

// Delete a booking (admin only)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting booking', error: error.message });
  }
});

module.exports = router;
