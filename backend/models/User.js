const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { 
        type: String, 
        enum: ['admin', 'user', 'gardener', 'vendor'], // 👈 Added roles
        default: 'user'
    },
    profilePhoto: { 
        type: String, 
        default: function() {
            return `${process.env.CLOUDINARY_BASE_URL}/default_profile.png`;
        }
    },
    address: {
        street: { type: String, default: "" },
        city: { type: String, default: "" },
        state: { type: String, default: "" },
        postalCode: { type: String, default: "" },
        country: { type: String, default: "" }
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
