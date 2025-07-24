const mongoose = require('mongoose');
const Delivery = require('../models/Delivery');

async function initializeDeliveryArrays() {
    try {
        console.log('Initializing arrays for all deliveries...');
        
        // Initialize statusHistory for all documents that don't have it
        const statusHistoryResult = await Delivery.updateMany(
            { statusHistory: { $exists: false } },
            { $set: { statusHistory: [] } }
        );
        
        // Initialize timeline for all documents that don't have it
        const timelineResult = await Delivery.updateMany(
            { timeline: { $exists: false } },
            { $set: { timeline: [] } }
        );
        
        console.log('Initialization complete:', {
            statusHistory: statusHistoryResult,
            timeline: timelineResult
        });
        
    } catch (error) {
        console.error('Error initializing delivery arrays:', error);
    }
}

module.exports = { initializeDeliveryArrays };
