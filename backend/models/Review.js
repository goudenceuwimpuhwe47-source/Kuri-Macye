const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Prevent user from submitting more than one review per product
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Static method to get avg rating and save
ReviewSchema.statics.getAverageRating = async function (productId) {
    const obj = await this.aggregate([
        {
            $match: { product: productId }
        },
        {
            $group: {
                _id: '$product',
                averageRating: { $avg: '$rating' }
            }
        }
    ]);

    try {
        await this.model('Product').findByIdAndUpdate(productId, {
            averageRating: obj[0] ? obj[0].averageRating : 0
        });
    } catch (err) {
        console.error(err);
    }
};

// Call getAverageRating after save
ReviewSchema.post('save', function () {
    this.constructor.getAverageRating(this.product);
});

// Call getAverageRating before remove
ReviewSchema.pre('remove', function () {
    this.constructor.getAverageRating(this.product);
});

module.exports = mongoose.model('Review', ReviewSchema);
