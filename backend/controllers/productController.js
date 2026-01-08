const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const Product = require('../models/Product');
const SellerProfile = require('../models/SellerProfile');

// @desc    Get all products (Admin - includes inactive/blocked)
// @route   GET /api/products/admin/all
// @access  Private (Admin)
exports.getAdminProducts = asyncHandler(async (req, res, next) => {
    const products = await Product.find().populate({
        path: 'sellerId',
        select: 'name email'
    });

    res.status(200).json({
        success: true,
        count: products.length,
        data: products
    });
});

// @desc    Get all products (Seller - only their own)
// @route   GET /api/products/seller/my-products
// @access  Private (Seller)
exports.getSellerProducts = asyncHandler(async (req, res, next) => {
    console.log('Fetching products for seller:', req.user._id);
    const products = await Product.find({ sellerId: req.user._id });
    console.log('Found products count:', products.length);

    res.status(200).json({
        success: true,
        count: products.length,
        data: products
    });
});

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res, next) => {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude from matching
    const removeFields = ['select', 'sort', 'page', 'limit', 'search', 'minPrice', 'maxPrice'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    const activeSellers = await SellerProfile.find({ status: 'active' }).select('user');
    const activeSellerIds = activeSellers.map(s => s.user.toString());

    query = Product.find({ ...JSON.parse(queryStr), sellerId: { $in: activeSellerIds } }).populate({
        path: 'sellerId',
        select: 'name email'
    });

    // Filtering by Price Range
    if (req.query.minPrice) {
        query = query.where('price').gte(req.query.minPrice);
    }
    if (req.query.maxPrice) {
        query = query.where('price').lte(req.query.maxPrice);
    }

    // Search by Name or Description
    // Search by Name or Description (Multi-keyword support)
    if (req.query.search) {
        const searchTerms = req.query.search.split(' ').map(term => term.trim()).filter(t => t);
        if (searchTerms.length > 0) {
            const regexSearch = searchTerms.map(term => ({
                $or: [
                    { name: { $regex: term, $options: 'i' } },
                    { description: { $regex: term, $options: 'i' } }
                ]
            }));
            query = query.find({ $and: regexSearch });
        }
    }

    // Select Fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Product.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const products = await query;

    // Attach store names from SellerProfile
    const sellerIds = [...new Set(products.map(p => p.sellerId?._id?.toString()).filter(Boolean))];
    const sellerProfiles = await SellerProfile.find({ user: { $in: sellerIds } }).select('user storeName');
    const storeNameMap = {};
    sellerProfiles.forEach(sp => {
        storeNameMap[sp.user.toString()] = sp.storeName;
    });

    const productsWithStore = products.map(p => {
        const productObj = p.toObject();
        productObj.storeName = storeNameMap[p.sellerId?._id?.toString()] || 'Unknown Store';
        return productObj;
    });

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        };
    }

    res.status(200).json({
        success: true,
        count: productsWithStore.length,
        pagination,
        data: productsWithStore
    });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id).populate({
        path: 'sellerId',
        select: 'name email'
    });

    if (!product) {
        return next(
            new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
        );
    }

    // Get store name from SellerProfile
    const sellerProfile = await SellerProfile.findOne({ user: product.sellerId?._id }).select('storeName');
    const productObj = product.toObject();
    productObj.storeName = sellerProfile?.storeName || 'Unknown Store';

    res.status(200).json({
        success: true,
        data: productObj
    });
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Seller/Admin)
exports.createProduct = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    req.body.sellerId = req.user.id;

    // Check if seller is active
    if (req.user.role === 'seller') {
        const sellerProfile = await SellerProfile.findOne({ user: req.user._id });
        if (!sellerProfile || sellerProfile.status !== 'active') {
            return next(new ErrorResponse('Your seller account is not active. Contact admin.', 403));
        }
    }

    // Handle file upload
    if (req.file) {
        req.body.imageUrl = `/uploads/products/${req.file.filename}`;
    }

    // Ensure sellerId is set correctly as ObjectId
    req.body.sellerId = req.user._id;

    console.log('Creating product for seller:', req.user._id, 'Data:', req.body);
    const product = await Product.create(req.body);

    res.status(201).json({
        success: true,
        data: product
    });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Seller/Admin)
exports.updateProduct = asyncHandler(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(
            new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
        );
    }

    // Make sure user is product owner or admin
    if (product.sellerId.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to update this product`,
                401
            )
        );
    }

    // Handle file upload
    if (req.file) {
        req.body.imageUrl = `/uploads/products/${req.file.filename}`;
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: product
    });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Seller/Admin)
exports.deleteProduct = asyncHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(
            new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
        );
    }

    // Make sure user is product owner or admin
    if (product.sellerId.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to delete this product`,
                401
            )
        );
    }

    await product.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
exports.getRelatedProducts = asyncHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(
            new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
        );
    }

    const related = await Product.find({
        category: product.category,
        _id: { $ne: product._id }
    }).limit(6);

    res.status(200).json({
        success: true,
        data: related
    });
});
