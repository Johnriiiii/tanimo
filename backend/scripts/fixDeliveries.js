require('dotenv').config();
const mongoose = require('mongoose');
const Delivery = require('../models/Delivery');

function normalizeStatus(status) {
    const statusMap = {
        'picked_up': 'Picked Up',
        'in_transit': 'In Transit',
        'out_for_delivery': 'Out for Delivery',
        'delivered': 'Delivered',
        'pending': 'Pending'
    };
    return statusMap[status.toLowerCase()] || status;
}

async function fixDeliveries() {
    try {
        console.log('Starting delivery fix...');
        
        // First, update all documents using updateMany for arrays
        const updateResult = await Delivery.updateMany(
            {
                $or: [
                    { timeline: { $exists: false } },
                    { statusHistory: { $exists: false } }
                ]
            },
            {
                $set: {
                    timeline: [],
                    statusHistory: []
                }
            },
            { strict: false }
        );

        console.log('Bulk update result:', updateResult);

        // Now find all deliveries that need status normalization
        const deliveries = await Delivery.find({});
        let fixCount = 0;

        for (const delivery of deliveries) {
            let modified = false;

            // Initialize arrays if needed
            if (!Array.isArray(delivery.timeline)) {
                delivery.timeline = [];
                modified = true;
            }
            if (!Array.isArray(delivery.statusHistory)) {
                delivery.statusHistory = [];
                modified = true;
            }

            // Copy customerContact to customer if needed
            if (!delivery.customer && delivery.customerContact) {
                delivery.customer = delivery.customerContact;
                modified = true;
            }

            // Ensure customerContact is set from customer if missing
            if (!delivery.customerContact && delivery.customer) {
                delivery.customerContact = delivery.customer;
                modified = true;
            }

            // Copy gardener to vendor if needed
            if (!delivery.vendor && delivery.gardener) {
                delivery.vendor = delivery.gardener;
                modified = true;
            }

            // Ensure gardener is set from vendor if missing
            if (!delivery.gardener && delivery.vendor) {
                delivery.gardener = delivery.vendor;
                modified = true;
            }

            // Initialize arrays if they are undefined (not just empty)
            if (delivery.timeline === undefined) {
                delivery.timeline = [];
                modified = true;
            }
            if (delivery.statusHistory === undefined) {
                delivery.statusHistory = [];
                modified = true;
            }

            // Add current status to arrays if empty
            if (delivery.timeline.length === 0 && delivery.status) {
                delivery.timeline.push({
                    status: normalizeStatus(delivery.status),
                    timestamp: delivery.updatedAt || new Date(),
                    notes: 'Status initialized'
                });
                modified = true;
            }

            if (delivery.statusHistory.length === 0 && delivery.status) {
                delivery.statusHistory.push({
                    status: normalizeStatus(delivery.status),
                    timestamp: delivery.updatedAt || new Date()
                });
                modified = true;
            }

            // Normalize status in timeline
            if (delivery.timeline.length > 0) {
                delivery.timeline.forEach(entry => {
                    if (entry.status) {
                        const normalizedStatus = normalizeStatus(entry.status);
                        if (entry.status !== normalizedStatus) {
                            entry.status = normalizedStatus;
                            modified = true;
                        }
                    }
                });
            }

            // Save if modified
            if (modified) {
                try {
                    await delivery.save({ validateBeforeSave: false });
                    fixCount++;
                    console.log(`✅ Fixed delivery: ${delivery._id}`);
                } catch (err) {
                    console.log(`❌ Could not save delivery ${delivery._id}:`, err.message);
                }
            }
        }

        console.log(`Successfully fixed ${fixCount} deliveries`);
    } catch (error) {
        console.error('Error fixing deliveries:', error);
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
        return fixDeliveries();
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
