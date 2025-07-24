require('dotenv').config();
const mongoose = require('mongoose');
const Delivery = require('../models/Delivery');

async function fixAddresses() {
    try {
        console.log('Starting address fix...');
        
        const deliveries = await Delivery.find({});
        let fixCount = 0;

        for (const delivery of deliveries) {
            let modified = false;
            const address = delivery.get('address');

            // Skip if no address
            if (!address) continue;

            try {
                if (typeof address === 'object' && address !== null) {
                    // Already an object, ensure it has all fields
                    delivery.address = {
                        street: address.street || '',
                        city: address.city || '',
                        state: address.state || '',
                        postalCode: address.postalCode || '',
                        country: address.country || '',
                        _id: address._id
                    };
                    modified = true;
                }

                if (modified) {
                    delivery.markModified('address');
                    await delivery.save({ validateBeforeSave: false });
                    fixCount++;
                    console.log(`✅ Fixed address for delivery: ${delivery._id}`);
                }
            } catch (err) {
                console.log(`❌ Could not fix address for delivery ${delivery._id}:`, err.message);
            }
        }

        console.log(`Successfully fixed ${fixCount} delivery addresses`);
    } catch (error) {
        console.error('Error fixing addresses:', error);
        throw error;
    }
}

// Run the fix if MONGO_URI is available
if (!process.env.MONGO_URI) {
    console.error('Error: MONGO_URI not found in environment variables');
    process.exit(1);
}

// Connect and run
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        return fixAddresses();
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
