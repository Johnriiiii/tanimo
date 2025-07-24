const mongoose = require('mongoose');

// Define the address schema
const addressSchema = new mongoose.Schema({
    street: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    postalCode: {
        type: String,
        default: ''
    },
    country: {
        type: String,
        default: ''
    }
}, { _id: false }); // Disable _id for subdocuments

module.exports = addressSchema;
