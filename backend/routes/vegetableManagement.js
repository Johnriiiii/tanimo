const express = require('express');
const router = express.Router();
const Vegetable = require('../models/Vegetable');
const User = require('../models/User');
const authenticate = require('../middleware/auth');

// Protect all routes after this middleware
router.use(authenticate);

// Create new vegetable (gardener only)
router.post('/', async (req, res) => {
    try {
        // Check if user is gardener
        if (req.user.userType !== 'gardener') {
            return res.status(403).json({ 
                status: 'fail',
                message: 'Only gardeners can create vegetables' 
            });
        }

        const { name, category, quantity, price, description, isAvailable } = req.body;
        
        const newVegetable = await Vegetable.create({
            name,
            category,
            quantity,
            price,
            description,
            isAvailable: isAvailable !== undefined ? isAvailable : true,
            gardener: req.user.id // Automatically assign to current user
        });

        await newVegetable.populate({
            path: 'gardener',
            select: 'name email'
        });

        res.status(201).json({
            status: 'success',
            data: {
                vegetable: newVegetable
            }
        });
    } catch (err) {
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({
                status: 'fail',
                message: messages.join('. ')
            });
        }
        res.status(500).json({ 
            status: 'error',
            message: 'Server error' 
        });
    }
});

// Get all vegetables (with optional filters)
router.get('/', async (req, res) => {
    try {
        const filter = {};
        
        // Apply filters if provided
        if (req.query.available === 'true') filter.isAvailable = true;
        if (req.query.available === 'false') filter.isAvailable = false;
        
        // For non-admin users, only show their own vegetables
        if (req.user.userType !== 'admin') {
            filter.gardener = req.user.id;
        } else if (req.query.gardener) {
            // Admins can filter by specific gardener
            filter.gardener = req.query.gardener;
        }

        const vegetables = await Vegetable.find(filter)
            .populate({
                path: 'gardener',
                select: 'name email'
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            status: 'success',
            results: vegetables.length,
            data: {
                vegetables
            }
        });
    } catch (err) {
        res.status(500).json({ 
            status: 'error',
            message: 'Server error' 
        });
    }
});

// Get single vegetable by ID (with ownership check)
router.get('/:id', async (req, res) => {
    try {
        const vegetable = await Vegetable.findOne({
            _id: req.params.id,
            gardener: req.user.userType !== 'admin' ? req.user.id : { $exists: true }
        }).populate({
            path: 'gardener',
            select: 'name email'
        });

        if (!vegetable) {
            return res.status(404).json({
                status: 'fail',
                message: 'Vegetable not found or not authorized'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                vegetable
            }
        });
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid vegetable ID'
            });
        }
        res.status(500).json({ 
            status: 'error',
            message: 'Server error' 
        });
    }
});

// Update vegetable (gardener only - and only their own vegetables)
router.patch('/:id', async (req, res) => {
    try {
        // Find the vegetable with ownership check
        const vegetable = await Vegetable.findOne({
            _id: req.params.id,
            gardener: req.user.id
        });

        if (!vegetable) {
            return res.status(404).json({
                status: 'fail',
                message: 'Vegetable not found or not authorized'
            });
        }

        // Only allow certain fields to be updated
        const allowedUpdates = ['name', 'category', 'quantity', 'price', 'description', 'isAvailable'];
        const updates = Object.keys(req.body);
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid updates!'
            });
        }

        // Apply updates
        updates.forEach(update => vegetable[update] = req.body[update]);
        await vegetable.save();

        await vegetable.populate({
            path: 'gardener',
            select: 'name email'
        });

        res.status(200).json({
            status: 'success',
            data: {
                vegetable
            }
        });
    } catch (err) {
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({
                status: 'fail',
                message: messages.join('. ')
            });
        }
        if (err.kind === 'ObjectId') {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid vegetable ID'
            });
        }
        res.status(500).json({ 
            status: 'error',
            message: 'Server error' 
        });
    }
});

// Delete vegetable (gardener only - and only their own vegetables)
router.delete('/:id', async (req, res) => {
    try {
        const result = await Vegetable.deleteOne({
            _id: req.params.id,
            gardener: req.user.id
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                status: 'fail',
                message: 'Vegetable not found or not authorized'
            });
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid vegetable ID'
            });
        }
        res.status(500).json({ 
            status: 'error',
            message: 'Server error' 
        });
    }
});

module.exports = router;