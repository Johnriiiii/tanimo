const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Vegetable = require('../models/Vegetable');

// GET /user/gardeners → fetch all gardeners with their vegetables
router.get('/gardeners', async (req, res) => {
  try {
    const gardeners = await User.find({ userType: 'gardener' });

    const gardenersWithVegetables = await Promise.all(
      gardeners.map(async (gardener) => {
        const vegetables = await Vegetable.find({ gardener: gardener._id }).select('name image category');
        return {
          _id: gardener._id,
          name: gardener.name,
          email: gardener.email,
          profilePhoto: gardener.profilePhoto,
          address: gardener.address,
          vegetables
        };
      })
    );

    res.status(200).json(gardenersWithVegetables);
  } catch (error) {
    console.error('Error fetching gardeners with vegetables:', error);
    res.status(500).json({ message: 'Server error while fetching gardeners' });
  }
});

module.exports = router;
