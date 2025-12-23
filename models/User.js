const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    // --- Plan Status ---
    plan: { 
        type: String, 
        default: 'Free', 
        enum: ['Free', 'Starter', 'Growth', 'Enterprise'] 
    },
    // --- NEW SETTINGS FIELDS (For the Settings Page) ---
    notifications: { 
        type: Boolean, 
        default: true 
    },
    twoFactor: { 
        type: Boolean, 
        default: false 
    },
    billingLast4: { 
        type: String, 
        default: "4242" // Mock data for display
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);