const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews
// @access  Private (Admin)
exports.getAllReviews = asyncHandler(async (req, res, next) => {
    const reviews = await Review.find()
        .populate('user', 'name email')
        .populate('product', 'name');

    res.status(200).json({
        success: true,
        count: reviews.length,
        data: reviews
    });
});

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
exports.getReviews = asyncHandler(async (req, res, next) => {
    const reviews = await Review.find({ product: req.params.productId }).populate('user', 'name');

    res.status(200).json({
        success: true,
        count: reviews.length,
        data: reviews
    });
});

// @desc    Add a review
// @route   POST /api/reviews
// @access  Private
exports.addReview = asyncHandler(async (req, res, next) => {
    const { productId, rating, comment } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
        return next(new ErrorResponse('Product not found', 404));
    }

    // Check if user has already reviewed
    const existingReview = await Review.findOne({ user: req.user.id, product: productId });
    if (existingReview) {
        return next(new ErrorResponse('You have already reviewed this product', 400));
    }

    // Check if user has bought the product (requirement: "only if they have bought it before")
    const order = await Order.findOne({
        customer: req.user.id,
        'orderItems.product': productId,
        orderStatus: 'DELIVERED'
    });

    if (!order) {
        return next(new ErrorResponse('You can only review products you have purchased and received', 403));
    }

    const review = await Review.create({
        user: req.user.id,
        product: productId,
        name: req.user.name,
        rating,
        comment
    });

    res.status(201).json({
        success: true,
        data: review
    });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (Owner/Admin)
exports.deleteReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        return next(new ErrorResponse('Review not found', 404));
    }

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorized', 401));
    }

    await review.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});
