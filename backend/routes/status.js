const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Delivery = require('../models/Delivery');

// PATCH - Update delivery status
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const { status, notes } = req.body;
        const deliveryId = req.params.id;

        console.log('⭐ Updating delivery status:', {
            id: deliveryId,
            newStatus: status,
            notes
        });

        // Use the static method for safe updates
        const updatedDelivery = await Delivery.updateDeliveryStatus(deliveryId, status, notes);

        if (!updatedDelivery) {
            console.log('❌ Delivery not found:', deliveryId);
            return res.status(404).json({
                message: 'Delivery not found'
            });
        }

        console.log('✅ Status updated successfully:', {
            id: updatedDelivery._id,
            status: updatedDelivery.status,
            timelineLength: updatedDelivery.timeline?.length,
            statusHistoryLength: updatedDelivery.statusHistory?.length
        });

        res.json({
            message: 'Status updated successfully',
            delivery: updatedDelivery
        });

    } catch (error) {
        console.error('❌ Error updating status:', error);
        res.status(500).json({
            message: 'Error updating delivery status',
            error: error.message
        });
    }
});
