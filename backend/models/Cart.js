const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    cartItems: [
        {
            product: {
                type: mongoose.Schema.ObjectId,
                ref: 'Product',
                required: true
            },
            name: String,
            image: String,
            price: Number,
            qty: {
                type: Number,
                default: 1
            },
            seller: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true
            }
        }
    ]
}, {
    timestamps: true
});

module.exports = mongoose.model('Cart', CartSchema);
