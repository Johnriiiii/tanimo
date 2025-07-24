const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    orderNumber: { type: String },
    customerName: { type: String },
    status: { type: String, default: 'pending' },
    address: { 
        type: mongoose.Schema.Types.Mixed,
        validate: {
            validator: function(v) {
                if (!v) return true;
                if (typeof v === 'string') return true;
                if (typeof v === 'object') {
                    return v.street && v.city && v.state;
                }
                return false;
            },
            message: 'Address must be either a string or an object with street, city, and state'
        }
    },
    items: [{
        vegetable: { type: mongoose.Schema.Types.ObjectId, ref: 'Vegetable' },
        quantity: { type: Number },
        price: { type: Number }
    }],
    totalAmount: { type: Number },
    timeline: [{
        status: { type: String },
        timestamp: { type: Date, default: Date.now },
        notes: { type: String }
    }],
    statusHistory: [{
        status: { type: String },
        timestamp: { type: Date, default: Date.now }
    }],
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customerContact: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    gardener: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    expectedDeliveryDate: { type: Date },
    actualDeliveryTime: { type: Date }
}, { timestamps: true });

// Pre-save middleware
deliverySchema.pre('save', function(next) {
    if (!this.timeline) this.timeline = [];
    if (!this.statusHistory) this.statusHistory = [];
    next();
});

// Static method to update delivery status
deliverySchema.statics.updateDeliveryStatus = async function(deliveryId, status, notes) {
    try {
        const delivery = await this.findById(deliveryId);
        if (!delivery) return null;

        // Initialize arrays if needed
        if (!delivery.timeline) delivery.timeline = [];
        if (!delivery.statusHistory) delivery.statusHistory = [];

        // Update status
        delivery.status = status;
        
        const timestamp = new Date();

        // Add to timeline
        delivery.timeline.push({
            status,
            timestamp,
            notes: notes || `Status updated to ${status}`
        });

        // Add to statusHistory
        delivery.statusHistory.push({
            status,
            timestamp
        });

        // Mark arrays as modified
        delivery.markModified('timeline');
        delivery.markModified('statusHistory');

        // Save and return
        await delivery.save();
        return delivery;
    } catch (error) {
        console.error('Error in updateDeliveryStatus:', error);
        throw error;
    }
};

module.exports = mongoose.model('Delivery', deliverySchema);
