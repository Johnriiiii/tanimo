require('dotenv').config();
const mongoose = require('mongoose');
const Delivery = require('../models/Delivery');

async function normalizeDeliveryAddresses() {
    try {
        console.log('Starting address normalization...');
        
        const deliveries = await Delivery.find({});
        console.log(`Found ${deliveries.length} deliveries to process`);
        
        let updated = 0;
        
        for (const delivery of deliveries) {
            if (delivery.address) {
                try {
                    if (typeof delivery.address === 'string') {
                        const parts = delivery.address.split(',').map(part => part.trim());
                        delivery.address = {
                            street: parts[0] || '',
                            city: parts[1] || '',
                            state: parts[2] || '',
                            postalCode: parts[3] || '',
                            country: parts[4] || ''
                        };
                        delivery.markModified('address');
                        await delivery.save();
                        updated++;
                        console.log(`✅ Updated address for delivery ${delivery._id}`);
                    } else if (typeof delivery.address === 'object') {
                        // Ensure all fields exist
                        delivery.address = {
                            street: delivery.address.street || '',
                            city: delivery.address.city || '',
                            state: delivery.address.state || '',
                            postalCode: delivery.address.postalCode || '',
                            country: delivery.address.country || ''
                        };
                        delivery.markModified('address');
                        await delivery.save();
                        updated++;
                        console.log(`✅ Normalized address for delivery ${delivery._id}`);
                    }
                } catch (err) {
                    console.error(`❌ Error updating delivery ${delivery._id}:`, err.message);
                }
            }
        }
        
        console.log(`Updated ${updated} delivery addresses`);
        
    } catch (err) {
        console.error('Error:', err);
    }
}

if (!process.env.MONGO_URI) {
    console.error('Error: MONGO_URI not found in environment');
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        return normalizeDeliveryAddresses();
    })
    .then(() => {
        console.log('Disconnecting...');
        return mongoose.disconnect();
    })
    .catch(err => {
        console.error('Script error:', err);
        mongoose.disconnect();
    });
