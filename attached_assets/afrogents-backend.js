// server.js - Main entry point for the AfroGents backend

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const stylistRoutes = require('./routes/stylists');
const bookingRoutes = require('./routes/bookings');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err));

// Authentication middleware
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      }
      
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ message: 'Authentication token required' });
  }
};

// Admin middleware
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', authenticateJWT, serviceRoutes);
app.use('/api/stylists', authenticateJWT, stylistRoutes);
app.use('/api/bookings', authenticateJWT, bookingRoutes);

// Admin dashboard route protection
app.use('/api/admin/*', authenticateJWT, isAdmin);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to AfroGents Home Service Salon API' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
