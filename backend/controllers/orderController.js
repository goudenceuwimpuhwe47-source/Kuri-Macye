const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const SellerProfile = require('../models/SellerProfile');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.addOrderItems = asyncHandler(async (req, res, next) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        totalPrice
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        return next(new ErrorResponse('No order items', 400));
    }

    const order = new Order({
        orderItems,
        customer: req.user.id,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        totalPrice
    });

    // Check for sufficient stock before saving order
    for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (!product) {
            return next(new ErrorResponse(`Product not found with id of ${item.product}`, 404));
        }
        if (product.stock < item.qty) {
            return next(new ErrorResponse(`Product '${product.name}' is out of stock or does not have enough quantity. Available: ${product.stock}`, 400));
        }
    }

    const createdOrder = await order.save();

    // Decrease product stock
    for (const item of orderItems) {
        console.log(`Processing stock for item: ${item.product} (Qty: ${item.qty})`);
        const product = await Product.findById(item.product);
        if (product) {
            const oldStock = product.stock;
            product.stock = product.stock - item.qty;
            await product.save();
            console.log(`Stock updated for ${product.name}: ${oldStock} -> ${product.stock}`);
        } else {
            console.error(`Product not found during stock deduction: ${item.product}`);
        }
    }

    // Clear cart after order
    await Cart.findOneAndUpdate({ user: req.user.id }, { cartItems: [] });

    res.status(201).json({
        success: true,
        data: createdOrder
    });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private (Customer/Seller/Admin)
exports.getOrderById = asyncHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate(
        'customer',
        'name email'
    );

    if (!order) {
        return next(new ErrorResponse('Order not found', 404));
    }

    // Check if user is authorized to see this order
    // 1. Customer who placed the order
    // 2. Admin
    // 3. Seller whose product is in the order (this is checked in a filtered list for sellers generally, but here we can check if at least one item belongs to them)
    const isOwner = order.customer._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    const isRelevantSeller = order.orderItems.some(item => item.seller.toString() === req.user.id);

    if (!isOwner && !isAdmin && !isRelevantSeller) {
        return next(new ErrorResponse('Not authorized to view this order', 401));
    }

    // If seller, filter items to only show theirs (per requirements: "Seller: view orders that include their products only")
    if (req.user.role === 'seller' && !isAdmin) {
        order.orderItems = order.orderItems.filter(item => item.seller.toString() === req.user.id);
    }

    res.status(200).json({
        success: true,
        data: order
    });
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = asyncHandler(async (req, res, next) => {
    const orders = await Order.find({ customer: req.user.id });

    // Collect all unique seller IDs from all orders
    let sellerIds = [];
    orders.forEach(order => {
        order.orderItems.forEach(item => {
            if (item.seller) sellerIds.push(item.seller.toString());
        });
    });
    sellerIds = [...new Set(sellerIds)];

    // Fetch seller profiles
    const profiles = await SellerProfile.find({ user: { $in: sellerIds } }).select('user storeName');
    const storeMap = {};
    profiles.forEach(p => {
        storeMap[p.user.toString()] = p.storeName;
    });

    // Attach store names to orders
    const ordersWithStores = orders.map(order => {
        const orderObj = order.toObject();
        orderObj.orderItems = orderObj.orderItems.map(item => ({
            ...item,
            storeName: storeMap[item.seller?.toString()] || 'Authorized Store'
        }));
        return orderObj;
    });

    res.status(200).json({
        success: true,
        data: ordersWithStores
    });
});

// @desc    Get all orders (Admin) or Relevant orders (Seller)
// @route   GET /api/orders
// @access  Private (Admin/Seller)
exports.getOrders = asyncHandler(async (req, res, next) => {
    let orders;

    if (req.user.role === 'admin') {
        orders = await Order.find({}).populate('customer', 'id name');
    } else if (req.user.role === 'seller') {
        // Find orders that contain items from this seller
        orders = await Order.find({
            'orderItems.seller': req.user.id
        }).populate('customer', 'id name');

        // Filter items within each order to only show seller's items
        orders = orders.map(order => {
            const orderObj = order.toObject();
            orderObj.orderItems = orderObj.orderItems.filter(item => item.seller.toString() === req.user.id);
            return orderObj;
        });
    }

    res.status(200).json({
        success: true,
        data: orders
    });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin)
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorResponse('Order not found', 404));
    }

    order.orderStatus = req.body.status || order.orderStatus;

    if (req.body.status === 'DELIVERED') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        order.shippingStatus = 'DELIVERED';
    }

    if (req.body.status === 'SHIPPED') {
        order.shippingStatus = 'IN_TRANSIT';
    }

    const updatedOrder = await order.save();

    res.status(200).json({
        success: true,
        data: updatedOrder
    });
});

// @desc    Update shipping status
// @route   PUT /api/orders/:id/shipping
// @access  Private (Admin/Seller)
exports.updateShippingStatus = asyncHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorResponse('Order not found', 404));
    }

    // If seller, check if they own items in this order
    const isRelevantSeller = order.orderItems.some(item => item.seller.toString() === req.user.id);
    if (req.user.role === 'seller' && !isRelevantSeller && req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorized', 401));
    }

    order.shippingStatus = req.body.status;

    if (req.body.status === 'DELIVERED') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        order.orderStatus = 'DELIVERED';
    }

    const updatedOrder = await order.save();

    res.status(200).json({
        success: true,
        data: updatedOrder
    });
});
