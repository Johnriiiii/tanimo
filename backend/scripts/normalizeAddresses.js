require('dotenv').config();
const mongoose = require('mongoose');
const Delivery = require('../models/Delivery');

async function normalizeAddresses() {
    try {
        console.log('Starting address normalization...');
        
        const deliveries = await Delivery.find({});
        let fixCount = 0;
        
        for (const delivery of deliveries) {
            try {
                let modified = false;
                
                if (delivery.address) {
                    // Normalize the address format
                    if (typeof delivery.address === 'object') {
                        delivery.address = {
                            street: delivery.address.street || '',
                            city: delivery.address.city || '',
                            state: delivery.address.state || '',
                            postalCode: delivery.address.postalCode || '',
                            country: delivery.address.country || ''
                        };
                        modified = true;
                    }
                }
                
                if (modified) {
                    delivery.markModified('address');
                    await delivery.save({ validateBeforeSave: false });
                    fixCount++;
                    console.log(`✅ Fixed address for delivery: ${delivery._id}`);
                }
            } catch (err) {
                console.error(`❌ Error fixing delivery ${delivery._id}:`, err.message);
            }
        }
        
        console.log(`Successfully normalized ${fixCount} addresses`);
        
    } catch (error) {
        console.error('Error normalizing addresses:', error);
        throw error;
    }
}

if (!process.env.MONGO_URI) {
    console.error('Error: MONGO_URI not found in environment variables');
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        return normalizeAddresses();
    })
    .then(() => {
        console.log('Disconnecting from MongoDB...');
        return mongoose.disconnect();
    })
    .then(() => {
        console.log('Done!');
        process.exit(0);
    })
    .catch(error => {
        console.error('Script failed:', error);
        mongoose.disconnect().finally(() => process.exit(1));
    });
