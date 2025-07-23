const express = require('express');
const router = express.Router();
const Vegetable = require('../models/Vegetable');
const User = require('../models/User');
const authenticate = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer with Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'vegetable-images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }]
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, JPG, PNG and WEBP are allowed.'), false);
    }
  }
});

// Protect all routes
router.use(authenticate);

// Get all vegetables
router.get('/', async (req, res) => {
  try {
    // Disable caching for this route
    res.set('Cache-Control', 'no-store');
    
    const vegetables = await Vegetable.find()
      .populate('gardener', 'name')
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      results: vegetables.length,
      data: {
        vegetables
      }
    });
  } catch (err) {
    console.error('Error fetching vegetables:', err);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to fetch vegetables' 
    });
  }
});

// Get single vegetable
router.get('/:id', async (req, res) => {
  try {
    // Disable caching
    res.set('Cache-Control', 'no-store');

    console.log('Fetching vegetable with ID:', req.params.id);
    
    const vegetable = await Vegetable.findById(req.params.id)
      .populate('gardener', 'name email')
      .lean();
    
    if (!vegetable) {
      console.log('Vegetable not found for ID:', req.params.id);
      return res.status(404).json({
        status: 'fail',
        message: 'Vegetable not found'
      });
    }

    console.log('Found vegetable:', vegetable);

    res.json({
      status: 'success',
      data: {
        vegetable: {
          ...vegetable,
          price: parseFloat(vegetable.price),
          quantity: parseInt(vegetable.quantity)
        }
      }
    });
  } catch (err) {
    console.error('Error fetching vegetable:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch vegetable details'
    });
  }
});

// Create new vegetable with optional image (gardener only)
router.post('/', upload.single('image'), async (req, res) => {
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
      gardener: req.user.id,
      image: req.file ? req.file.path : '' // Store Cloudinary URL if image exists
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
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
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

    // If vegetable has an image, delete it from Cloudinary
    if (vegetable.image) {
      const publicId = vegetable.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`vegetable-images/${publicId}`);
    }

    await vegetable.remove();

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