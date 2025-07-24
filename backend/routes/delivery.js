// ...existing code...
const express = require('express');
const router = express.Router();
const Delivery = require('../models/Delivery');
const auth = require('../middleware/auth');
const { initializeDeliveryArrays } = require('../scripts/initializeArrays');
const { createDelivery } = require('../controllers/DeliveryController');
router.post('/', auth, createDelivery);

// Get all deliveries (filtered by user role)
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    // Build query based on user role
    if (req.user.userType === 'customer') {
      query.$or = [
        { customer: req.user._id },
        { customerContact: req.user._id },
        { customerName: req.user.name }
      ];
    } else if (req.user.userType === 'gardener' || req.user.userType === 'vendor') {
      query.$or = [
        { vendor: req.user._id },
        { gardener: req.user._id }
      ];
    }

    const deliveries = await Delivery.find(query)
      .populate([
        'orderId', 
        'customer', 
        'vendor', 
        'customerContact', 
        'gardener',
        {
          path: 'items.vegetable',
          select: 'name'
        }
      ])
      .sort({ createdAt: -1 });

    // Map and format the deliveries
    const mappedDeliveries = deliveries.map(delivery => {
      // Initialize arrays if they don't exist
      delivery.timeline = Array.isArray(delivery.timeline) ? delivery.timeline : [];
      delivery.statusHistory = Array.isArray(delivery.statusHistory) ? delivery.statusHistory : [];

      return {
        _id: delivery._id,
        orderNumber: delivery.orderNumber,
        customerName: delivery.customerContact?.name || delivery.customerName || '',
        address: delivery.customerContact?.address || delivery.deliveryAddress || delivery.address || '',
        items: (delivery.items || []).map(item => ({
          name: item.vegetable?.name || '',
          quantity: item.quantity,
          price: item.price
        })),
        status: delivery.status,
        timeline: delivery.timeline,
        statusHistory: delivery.statusHistory,
        createdAt: delivery.createdAt,
        updatedAt: delivery.updatedAt,
        totalAmount: delivery.totalAmount,
        customer: delivery.customer,
        vendor: delivery.vendor,
        gardener: delivery.gardener,
        customerContact: delivery.customerContact,
        orderId: delivery.orderId
      };
    });

    res.json({
      status: 'success',
      deliveries: mappedDeliveries
    });
  } catch (err) {
    console.error('Error fetching deliveries:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch deliveries',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get a specific delivery
router.get('/:id', auth, async (req, res) => {
  try {
    const delivery = await Delivery.findOne({
      _id: req.params.id,
      $or: [
        { customer: req.user._id },
        { vendor: req.user._id },
        { customerContact: req.user._id },
        { customerName: req.user.name },
        { gardener: req.user._id }
      ]
    }).populate(['orderId', 'customer', 'vendor', 'customerContact', 'gardener']);

    if (!delivery) {
      return res.status(404).json({
        status: 'error',
        message: 'Delivery not found'
      });
    }

    res.json({
      status: 'success',
      delivery
    });
  } catch (err) {
    console.error('Error fetching delivery:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch delivery details',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Update delivery status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        status: 'error',
        message: 'Status is required'
      });
    }
    
    // Find the delivery (don't use lean() as we need a mongoose document)
    const delivery = await Delivery.findOne({
      _id: req.params.id,
      $or: [
        { customer: req.user._id },
        { vendor: req.user._id },
        { customerContact: req.user._id },
        { gardener: req.user._id },
        { customerName: req.user.name }
      ]
    });

    if (!delivery) {
      return res.status(404).json({
        status: 'error',
        message: 'Delivery not found or access denied'
      });
    }

    // Update the status
    delivery.status = status;

    // Initialize arrays if they don't exist
    delivery.timeline = Array.isArray(delivery.timeline) ? delivery.timeline : [];
    delivery.statusHistory = Array.isArray(delivery.statusHistory) ? delivery.statusHistory : [];

    // Add to timeline
    const timelineEntry = {
      status,
      timestamp: new Date(),
      notes: notes || ''
    };
    
    delivery.timeline.push(timelineEntry);
    
    // Also update statusHistory for backward compatibility
    delivery.statusHistory.push({
      status,
      timestamp: new Date()
    });

    // Save the updated delivery
    await delivery.save();
    
    // Populate related fields
    await delivery.populate([
      'customer', 
      'vendor', 
      'customerContact', 
      'gardener',
      {
        path: 'items.vegetable',
        select: 'name'
      }
    ]);

    res.json({
      status: 'success',
      delivery: delivery
    });
  } catch (err) {
    console.error('Error updating delivery status:', err);
    res.status(400).json({
      status: 'error',
      message: 'Failed to update delivery status',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;
