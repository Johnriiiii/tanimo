const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Delivery = require('../../models/Delivery');
const auth = require('../../middleware/auth');

// Test route to add sample deliveries (for development only)
router.post('/test-data', auth, async (req, res) => {
  try {
    // Clear existing test deliveries
    await Delivery.deleteMany({});

    const testDeliveries = [
      {
        orderId: new mongoose.Types.ObjectId(),
        status: 'Out for Delivery',
        customerContact: {
          name: 'John Doe',
          phone: '+1234567890',
          userId: req.user._id
        },
        address: {
          street: '123 Main St',
          city: 'Sample City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        },
        estimatedDeliveryTime: new Date(Date.now() + 24 * 60 * 60 * 1000)
      },
      {
        orderId: new mongoose.Types.ObjectId(),
        status: 'Delivered',
        customerContact: {
          name: 'Jane Smith',
          phone: '+1987654321',
          userId: req.user._id
        },
        address: {
          street: '456 Oak Avenue',
          city: 'Test Town',
          state: 'Test State',
          postalCode: '67890',
          country: 'Test Country'
        },
        estimatedDeliveryTime: new Date(Date.now() - 1 * 60 * 60 * 1000)
      }
    ];

    await Delivery.insertMany(testDeliveries);
    res.json({ 
      status: 'success',
      message: 'Test data added successfully'
    });
  } catch (error) {
    console.error('Error adding test data:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Error adding test data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
