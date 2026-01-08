const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const SellerProfile = require('../models/SellerProfile');
const generateOtp = require('../utils/otp');
const sendEmail = require('../utils/sendEmail');

const getOtpEmailTemplate = (otp, type) => {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #4f46e5; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0;">Kuri-Macye</h1>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
            <h2 style="color: #333333; margin-top: 0;">${type}</h2>
            <p style="color: #666666; font-size: 16px;">Use the code below to complete your verification. This code will expire in 10 minutes.</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4f46e5;">${otp}</span>
            </div>
            <p style="color: #666666; font-size: 14px;">If you didn't request this email, you can safely ignore it.</p>
        </div>
        <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #9ca3af;">
            &copy; ${new Date().getFullYear()} Kuri-Macye. All rights reserved.
        </div>
    </div>
    `;
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password, role, storeName, storeDescription, phone } = req.body;

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role: role || 'customer'
    });

    // If role is seller, create seller profile
    if (role === 'seller') {
        if (!storeName || !storeDescription || !phone) {
            // If seller details missing, we might want to delete the user or return error
            // But usually validation should happen before creation. 
            // Since we use asyncHandler, if creation fails below it will catch it.
            await User.findByIdAndDelete(user._id);
            return next(new ErrorResponse('Please provide all store details', 400));
        }

        try {
            await SellerProfile.create({
                user: user._id,
                storeName,
                storeDescription,
                phone,
                status: 'pending' // Default status is pending for audit
            });
        } catch (err) {
            // Clean up user if profile creation fails
            await User.findByIdAndDelete(user._id);
            return next(err);
        }
    }

    // Generate OTP for verification
    const otp = generateOtp();
    user.otp = otp;
    await user.save({ validateBeforeSave: false });

    // Send email
    const message = `Your account verification OTP is ${otp.code}. It expires in 10 minutes.`;
    const html = getOtpEmailTemplate(otp.code, 'Account Verification');

    try {
        await sendEmail({
            email: user.email,
            subject: 'Account Verification OTP',
            message,
            html
        });

        res.status(200).json({
            success: true,
            data: 'OTP sent to email',
            email: user.email
        });
    } catch (err) {
        // If email fails, delete user so they can try again
        await User.findByIdAndDelete(user._id);
        return next(new ErrorResponse('Verification email could not be sent', 500));
    }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
        return next(new ErrorResponse('Please provide an email and password', 400));
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if account is active
    if (user.status !== 'active') {
        return next(new ErrorResponse('Your account has been deactivated or blocked', 403));
    }

    // Generate OTP
    const otp = generateOtp();
    user.otp = otp;
    await user.save({ validateBeforeSave: false });

    // Send email
    const message = `Your login verification OTP is ${otp.code}. It expires in 10 minutes.`;
    const html = getOtpEmailTemplate(otp.code, 'Login Verification');

    try {
        await sendEmail({
            email: user.email,
            subject: 'Login Verification OTP',
            message,
            html
        });

        res.status(200).json({
            success: true,
            data: 'OTP sent to email',
            email: user.email // Send back email to help frontend reference it
        });
    } catch (err) {
        console.error(err);
        user.otp = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorResponse('Verification email could not be sent', 500));
    }
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
};

// @desc    Get current logged in user
// @route   POST /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user: user
    });
});

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        data: {}
    });
});


// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorResponse('There is no user with that email', 404));
    }

    // Get reset token
    const otp = generateOtp();
    user.otp = otp;

    await user.save({ validateBeforeSave: false });

    const message = `Your password reset OTP is ${otp.code}. It expires in 10 minutes.`;
    const html = getOtpEmailTemplate(otp.code, 'Password Reset Request');

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password reset OTP',
            message,
            html
        });

        res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
        console.log(err);
        user.otp = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorResponse('Email could not be sent', 500));
    }
});

// @desc    Reset password
// @route   PUT /api/auth/resetpassword
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
    const { email, otp, password } = req.body;

    if (otp.length !== 6) {
        return next(new ErrorResponse('OTP must be exactly 6 digits', 400));
    }

    const user = await User.findOne({
        email,
        'otp.code': otp,
        'otp.expireAt': { $gt: Date.now() }
    });

    if (!user) {
        return next(new ErrorResponse('Invalid or expired OTP', 400));
    }

    // Set new password
    user.password = password;
    user.otp = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
});

// @desc    Verify Login OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyLoginOtp = asyncHandler(async (req, res, next) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return next(new ErrorResponse('Please provide email and OTP', 400));
    }

    if (otp.length !== 6) {
        return next(new ErrorResponse('OTP must be exactly 6 digits', 400));
    }

    const user = await User.findOne({
        email,
        'otp.code': otp,
        'otp.expireAt': { $gt: Date.now() }
    });

    if (!user) {
        return next(new ErrorResponse('Invalid or expired OTP', 400));
    }

    // Clear OTP and verify user if not already verified
    user.otp = undefined;
    if (!user.isVerified) {
        user.isVerified = true;
    }
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
});
