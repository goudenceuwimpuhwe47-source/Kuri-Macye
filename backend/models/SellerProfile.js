const mongoose = require('mongoose');

const SellerProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    storeName: {
        type: String,
        required: [true, 'Please add a store name'],
        unique: true
    },
    storeDescription: {
        type: String,
        required: [true, 'Please add a store description']
    },
    phone: {
        type: String,
        required: [true, 'Please add a contact phone number']
    },
    logoUrl: {
        type: String,
        default: 'no-logo.jpg'
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'blocked'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SellerProfile', SellerProfileSchema);
