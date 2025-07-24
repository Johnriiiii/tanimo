const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');

// Create a new order
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

module.exports = router;
