const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = asyncHandler(async (req, res, next) => {
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
        cart = await Cart.create({ user: req.user.id, cartItems: [] });
    }

    res.status(200).json({
        success: true,
        data: cart
    });
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addItemToCart = asyncHandler(async (req, res, next) => {
    const { productId, qty } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
        return next(new ErrorResponse('Product not found', 404));
    }

    // Only customers can add to cart
    if (req.user.role !== 'customer') {
        return next(new ErrorResponse('Only customers can add items to cart', 403));
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
        cart = new Cart({ user: req.user.id, cartItems: [] });
    }

    const itemIndex = cart.cartItems.findIndex(p => p.product.toString() === productId);

    if (itemIndex > -1) {
        // Product exists in cart, update quantity
        cart.cartItems[itemIndex].qty += (qty || 1);
    } else {
        // Product does not exist in cart, add new item
        cart.cartItems.push({
            product: productId,
            name: product.name,
            image: product.imageUrl,
            price: product.price,
            qty: qty || 1,
            seller: product.sellerId
        });
    }

    await cart.save();

    res.status(200).json({
        success: true,
        data: cart
    });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:id
// @access  Private
exports.updateCartItem = asyncHandler(async (req, res, next) => {
    const { qty } = req.body;

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
        return next(new ErrorResponse('Cart not found', 404));
    }

    const itemIndex = cart.cartItems.findIndex(p => p._id.toString() === req.params.id);

    if (itemIndex === -1) {
        return next(new ErrorResponse('Item not found in cart', 404));
    }

    cart.cartItems[itemIndex].qty = qty;

    await cart.save();

    res.status(200).json({
        success: true,
        data: cart
    });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Private
exports.removeCartItem = asyncHandler(async (req, res, next) => {
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
        return next(new ErrorResponse('Cart not found', 404));
    }

    cart.cartItems = cart.cartItems.filter(p => p._id.toString() !== req.params.id);

    await cart.save();

    res.status(200).json({
        success: true,
        data: cart
    });
});
