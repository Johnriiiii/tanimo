const mongoose = require('mongoose');
const Vegetable = require('../models/Vegetable');
const User = require('../models/User');
require('dotenv').config();

async function addTestVegetable() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // First, let's find a gardener or create one if none exists
    let gardener = await User.findOne({ role: 'gardener' });
    if (!gardener) {
      gardener = new User({
        name: 'Test Gardener',
        email: 'test.gardener@example.com',
        password: 'password123',
        role: 'gardener',
        address: {
          street: '123 Garden St',
          city: 'Garden City',
          state: 'GS',
          zipCode: '12345'
        }
      });
      await gardener.save();
      console.log('Created test gardener:', gardener);
    }

    const testVegetable = new Vegetable({
      name: 'Test Tomato',
      description: 'Fresh organic tomatoes',
      price: 50.00,
      quantity: 100,
      image: 'https://res.cloudinary.com/demo/image/upload/tomato.jpg',
      category: 'Vegetables',
      gardener: gardener._id,
      isAvailable: true
    });

    await testVegetable.save();
    console.log('Test vegetable added successfully:', testVegetable);
    
    const allVegetables = await Vegetable.find();
    console.log('All vegetables in database:', allVegetables);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

addTestVegetable();
