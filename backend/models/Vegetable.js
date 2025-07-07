const mongoose = require('mongoose');

const vegetableSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide vegetable name'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please provide vegetable category'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide quantity'],
    min: [0, 'Quantity cannot be negative']
  },
  price: {
    type: Number,
    required: [true, 'Please provide price'],
    min: [0, 'Price cannot be negative']
  },
  description: {
    type: String,
    trim: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  gardener: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Vegetable must belong to a gardener']
  },
  image: {  // Single image field instead of array
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better performance
vegetableSchema.index({ name: 1 });
vegetableSchema.index({ category: 1 });
vegetableSchema.index({ gardener: 1 });

// Populate gardener information when querying vegetables
vegetableSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'gardener',
    select: 'name email'
  });
  next();
});

const Vegetable = mongoose.model('Vegetable', vegetableSchema);
module.exports = Vegetable;