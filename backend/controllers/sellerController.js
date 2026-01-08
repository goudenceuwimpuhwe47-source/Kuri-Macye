const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const SellerProfile = require('../models/SellerProfile');

// @desc    Get current user's seller profile
// @route   GET /api/sellers/profile
// @access  Private (Seller)
exports.getSellerProfile = asyncHandler(async (req, res, next) => {
    const profile = await SellerProfile.findOne({ user: req.user.id });

    if (!profile) {
        return next(new ErrorResponse('Seller profile not found', 404));
    }

    res.status(200).json({
        success: true,
        data: profile
    });
});

// @desc    Create or update seller profile
// @route   POST /api/sellers/profile
// @access  Private (Seller)
exports.updateSellerProfile = asyncHandler(async (req, res, next) => {
    let profile = await SellerProfile.findOne({ user: req.user.id });

    // Handle file upload
    if (req.file) {
        req.body.logoUrl = `/uploads/sellers/${req.file.filename}`;
    }

    if (profile) {
        // Update
        profile = await SellerProfile.findOneAndUpdate(
            { user: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );
    } else {
        // Create
        req.body.user = req.user.id;
        profile = await SellerProfile.create(req.body);


    }

    res.status(200).json({
        success: true,
        data: profile
    });
});

// @desc    Get all sellers (Admin)
// @route   GET /api/sellers
// @access  Private (Admin)
exports.getSellers = asyncHandler(async (req, res, next) => {
    const sellers = await SellerProfile.find().populate('user', 'name email');

    res.status(200).json({
        success: true,
        data: sellers
    });
});

// @desc    Approve or block seller (Admin)
// @route   PUT /api/sellers/:id/status
// @access  Private (Admin)
exports.updateSellerStatus = asyncHandler(async (req, res, next) => {
    const profile = await SellerProfile.findById(req.params.id);

    if (!profile) {
        return next(new ErrorResponse('Seller profile not found', 404));
    }

    profile.status = req.body.status;
    await profile.save();

    // Update user role based on status
    const user = await User.findById(profile.user);
    if (user) {
        if (req.body.status === 'active') {
            user.role = 'seller';
        } else {
            user.role = 'customer';
        }
        await user.save({ validateBeforeSave: false });
    }

    res.status(200).json({
        success: true,
        data: profile
    });
});

// Admin Controllers for User Management
// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin)
exports.getUsers = asyncHandler(async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({ success: true, data: users });
});

// @desc    Update user (deactivate/role)
// @route   PUT /api/users/:id
// @access  Private (Admin)
exports.updateUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({ success: true, data: user });
});
