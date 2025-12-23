const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Links this project to a specific User
        required: true
    },
    description: {
        type: String,
        required: true
    },
    businessName: {
        type: String, // The specific name the user chose
        required: true
    },
    slogan: {
        type: String // The slogan they chose
    },
    logoImage: {
        type: String // We will store the Base64 image string here
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Project', ProjectSchema);