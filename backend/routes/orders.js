const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const mongoose = require('mongoose');

// Create a new order (moved from createOrder.js)
router.post('/', auth, async (req, res) => {
    try {
        console.log('Creating new order with data:', JSON.stringify(req.body, null, 2));
        console.log('User making request:', req.user);

        // Validate required fields
        if (!req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
            throw new Error('Order must contain at least one item');
        }

        if (!req.body.deliveryAddress) {
            throw new Error('Delivery address is required');
        }

        // Create order with validated data
        const order = new Order({
            items: req.body.items.map(item => ({
                vegetable: item.vegetable,
                quantity: parseInt(item.quantity),
                price: parseFloat(item.price)
            })),
            totalAmount: parseFloat(req.body.totalAmount),
            customerContact: req.user._id,
            deliveryAddress: {
                street: req.body.deliveryAddress.street,
                city: req.body.deliveryAddress.city,
                state: req.body.deliveryAddress.state,
                zipCode: req.body.deliveryAddress.zipCode || ''
            },
            status: 'Pending'
        });

        console.log('Attempting to save order:', order);
        const savedOrder = await order.save();
        console.log('Order saved successfully:', savedOrder);
        
        // Populate the saved order
        const populatedOrder = await Order.findById(savedOrder._id)
            .populate('items.vegetable', 'name price')
            .populate('customerContact', 'name email phone')
            .lean();
            
        console.log('Populated order:', populatedOrder);

        // Also create a corresponding delivery in the deliveries collection
        const Delivery = require('../models/Delivery');
        const delivery = new Delivery({
            orderId: populatedOrder._id,
            orderNumber: populatedOrder.orderNumber,
            customerName: populatedOrder.customerContact?.name || 'Unknown',
            status: populatedOrder.status,
            address: populatedOrder.deliveryAddress,
            expectedDeliveryDate: populatedOrder.createdAt,
            items: populatedOrder.items.map(item => ({
                vegetable: item.vegetable._id || item.vegetable,
                quantity: item.quantity,
                price: item.price
            })),
            totalAmount: populatedOrder.totalAmount,
            customer: populatedOrder.customerContact?._id,
            vendor: req.user._id
        });
        await delivery.save();

        res.status(201).json({
            message: 'Order created successfully',
            order: {
                _id: populatedOrder._id,
                orderId: populatedOrder.orderNumber,
                status: populatedOrder.status,
                deliveryAddress: populatedOrder.deliveryAddress,
                expectedDeliveryDate: populatedOrder.createdAt,
                customerName: populatedOrder.customerContact?.name || 'Unknown',
                customerPhone: populatedOrder.customerContact?.phone || '',
                customerEmail: populatedOrder.customerContact?.email || '',
                items: populatedOrder.items.map(item => ({
                    name: item.vegetable.name,
                    quantity: item.quantity,
                    price: item.price
                })),
                totalAmount: populatedOrder.totalAmount
            }
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(400).json({ 
            message: 'Failed to create order',
            error: error.message 
        });
    }
});


// Get all orders (with filtering based on user role)
router.get('/', auth, async (req, res) => {
    try {
        console.log('Fetching orders for user:', req.user._id);
        
        let query = {};
        if (req.user.userType === 'vendor' || req.user.userType === 'gardener') {
            // Vendors/gardeners can see orders where they are listed as the vendor
            query.vendor = req.user._id;
        } else {
            // Customers can only see their own orders
            query.customerContact = req.user._id;
        }

        const orders = await Order.find(query)
            .populate('items.vegetable', 'name price image')
            .populate('customerContact', 'name email phone')
            .sort({ createdAt: -1 })
            .lean();

        console.log(`Found ${orders.length} orders`);

        res.json({
            status: 'success',
            orders: orders
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch orders',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Create a new order
router.post('/', auth, async (req, res) => {
    try {
        console.log('Creating new order with data:', JSON.stringify(req.body, null, 2));
        console.log('User creating order:', req.user._id);
        
        // Validate vegetable IDs
        for (const item of req.body.items) {
            if (!item.vegetable || !mongoose.Types.ObjectId.isValid(item.vegetable)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid vegetable ID format',
                    error: `Invalid vegetable ID: ${item.vegetable}`
                });
            }

            // Check if vegetable exists
            const vegetable = await mongoose.model('Vegetable').findById(item.vegetable);
            if (!vegetable) {
                return res.status(404).json({
                    success: false,
                    message: 'Vegetable not found',
                    error: `Vegetable with ID ${item.vegetable} does not exist`
                });
            }

            // Check if quantity is available
            if (vegetable.quantity < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: 'Insufficient quantity',
                    error: `Only ${vegetable.quantity} units available for ${vegetable.name}`
                });
            }
        }
        
        // Create a new order instance
        const order = new Order({
            items: req.body.items,
            totalAmount: req.body.totalAmount,
            deliveryAddress: req.body.deliveryAddress,
            status: req.body.status,
            customerContact: req.user._id // Set the customer as the authenticated user
        });

        console.log('Attempting to save order:', order);

        // Save the order and update vegetable quantities
        const savedOrder = await order.save();
        console.log('Order saved successfully:', savedOrder);

        // Update vegetable quantities
        for (const item of req.body.items) {
            await mongoose.model('Vegetable').findByIdAndUpdate(
                item.vegetable,
                { $inc: { quantity: -item.quantity } }
            );
        }

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order: savedOrder
        });
    } catch (error) {
        console.error('Error creating order:', error);
        
        // Send more detailed error message
        res.status(500).json({
            success: false,
            message: 'Failed to create order',
            error: error.message,
            details: error.errors ? Object.keys(error.errors).map(key => ({
                field: key,
                message: error.errors[key].message
            })) : undefined
        });
    }
});

// Get all orders
router.get('/', auth, async (req, res) => {
    try {
        console.log('=== DEBUG ORDER FETCH ===');
        console.log('User info:', {
            id: req.user._id,
            type: req.user.userType,
            email: req.user.email
        });
        
        // Build query based on user type
        let query = {};
        if (req.user.userType === 'vendor') {
            // Vendors see orders where they are the customer
            query.customerContact = req.user._id;
            console.log('Vendor query:', query);
        } else if (req.user.userType === 'gardener' || req.user.userType === 'admin') {
            // Gardeners and admins see all orders
            console.log('Showing all orders for gardener/admin');
        }
        
        console.log('Final query:', query);
        
        // First check if we have any orders
        const totalOrders = await Order.countDocuments();
        console.log('Total orders in database:', totalOrders);
        
        const orders = await Order.find(query)
            .populate('items.vegetable', 'name price')
            .populate('customerContact', 'name email phone')
            .sort({ createdAt: -1 });

        console.log(`Found ${orders.length} orders for the user`);
        console.log('Sample order:', orders[0] || 'No orders found');
        
        // Transform orders for frontend
        const transformedOrders = orders.map(order => ({
            _id: order._id,
            orderId: order.orderNumber,
            status: order.status,
            deliveryAddress: order.deliveryAddress,
            expectedDeliveryDate: order.createdAt,
            customerName: order.customerContact ? order.customerContact.name : 'Unknown',
            customerPhone: order.customerContact ? order.customerContact.phone : '',
            customerEmail: order.customerContact ? order.customerContact.email : '',
            statusHistory: order.statusHistory,
            items: order.items.map(item => ({
                name: item.vegetable.name,
                quantity: item.quantity,
                price: item.price
            })),
            totalAmount: order.totalAmount
        }));
        
        res.json(transformedOrders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update delivery/order status
// Update delivery status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status, notes } = req.body;

    // Allowed status values
    const allowedStatuses = ['Pending', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled'];

    // Validate status
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Allowed statuses are: ${allowedStatuses.join(', ')}` });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Add new status to history
    order.statusHistory.push({
      status,
      timestamp: Date.now(),
      notes
    });

    // Update current status
    order.status = status;

    // Update other fields if provided
    if (req.body.totalAmount) order.totalAmount = req.body.totalAmount;
    if (req.body.customerContact) order.customerContact = req.body.customerContact;
    if (req.body.items) order.items = req.body.items;
    if (req.body.deliveryAddress) order.deliveryAddress = req.body.deliveryAddress;

    await order.save();
    // Populate the order before sending response
    const populatedOrder = await Order.findById(order._id)
      .populate('items.vegetable', 'name price')
      .populate('customerContact', 'name email phone');

    // Transform the order for frontend
    const transformedOrder = {
      _id: populatedOrder._id,
      orderId: populatedOrder.orderNumber,
      status: populatedOrder.status,
      deliveryAddress: populatedOrder.deliveryAddress,
      expectedDeliveryDate: populatedOrder.createdAt,
      customerName: populatedOrder.customerContact ? populatedOrder.customerContact.name : 'Unknown',
      customerPhone: populatedOrder.customerContact ? populatedOrder.customerContact.phone : '',
      customerEmail: populatedOrder.customerContact ? populatedOrder.customerContact.email : '',
      statusHistory: populatedOrder.statusHistory,
      items: populatedOrder.items.map(item => ({
        name: item.vegetable.name,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount: populatedOrder.totalAmount
    };

    res.json(transformedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


module.exports = router;
