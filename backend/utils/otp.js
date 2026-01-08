const crypto = require('crypto');

// Generate and hash password token
const generateOtp = () => {
    // Generate 6 digit numeric OTP (100000 to 999999)
    const otpCode = crypto.randomInt(100000, 1000000).toString();

    // OTP expires in 10 minutes
    const otpExpireAt = Date.now() + 10 * 60 * 1000;

    return {
        code: otpCode,
        expireAt: otpExpireAt
    };
};

module.exports = generateOtp;
