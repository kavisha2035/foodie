const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    userType: {
        type: String,
        enum: ['user', 'foodpartner'],
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // TTL index — MongoDB auto-deletes expired docs
    }
}, {
    timestamps: true
});

const RefreshToken = mongoose.model('refreshToken', refreshTokenSchema);

module.exports = RefreshToken;
