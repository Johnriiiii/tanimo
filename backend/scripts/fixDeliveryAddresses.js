require('dotenv').config();
const mongoose = require('mongoose');
const Delivery = require('../models/Delivery');

function parseAddress(addressString) {
    if (!addressString) return null;
    
    // Try to parse common address formats
    const parts = addressString.split(',').map(p => p.trim());
    
    if (parts.length >= 2) {
        return {
            street: parts[0],
            city: parts[1],
            state: parts[2] || '',
            postalCode: parts[3] || '',
            country: parts[4] || ''
        };
    }
    
    // If can't parse, keep as string
    return addressString;
}

async function fixDeliveryAddresses() {
    try {
        console.log('Starting to fix delivery addresses...');
        
        const deliveries = await Delivery.find({});
        let fixCount = 0;
        
        for (const delivery of deliveries) {
            try {
                let modified = false;
                
                if (delivery.address) {
                    if (typeof delivery.address === 'string') {
                        // Try to parse string address into object
                        const parsedAddress = parseAddress(delivery.address);
                        if (typeof parsedAddress === 'object') {
                            delivery.address = parsedAddress;
                            modified = true;
                        }
                    } else if (typeof delivery.address === 'object') {
                        // Ensure object has all required fields
                        const normalizedAddress = {
                            street: delivery.address.street || '',
                            city: delivery.address.city || '',
                            state: delivery.address.state || '',
                            postalCode: delivery.address.postalCode || '',
                            country: delivery.address.country || ''
                        };
                        delivery.address = normalizedAddress;
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
        
        console.log(`Successfully fixed ${fixCount} delivery addresses`);
        
    } catch (error) {
        console.error('Error fixing delivery addresses:', error);
        throw error;
    }
}

// Run if MONGO_URI is available
if (!process.env.MONGO_URI) {
    console.error('Error: MONGO_URI not found in environment variables');
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        return fixDeliveryAddresses();
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
