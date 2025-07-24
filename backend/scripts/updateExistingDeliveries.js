const mongoose = require('mongoose');
const Delivery = require('../models/Delivery');

async function updateExistingDeliveries() {
    try {
        // Update all documents that don't have statusHistory
        await Delivery.updateMany(
            { statusHistory: { $exists: false } },
            { $set: { statusHistory: [] } }
        );

        // Update all documents that don't have timeline
        await Delivery.updateMany(
            { timeline: { $exists: false } },
            { $set: { timeline: [] } }
        );

        console.log('Successfully updated existing deliveries');
    } catch (error) {
        console.error('Error updating existing deliveries:', error);
    }
}

module.exports = updateExistingDeliveries;
