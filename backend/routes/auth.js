const express = require('express');
const passport = require('passport');
const { register, login, getMe, logout, forgotPassword, resetPassword, verifyLoginOtp } = require('../controllers/authController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyLoginOtp);
router.get('/logout', logout);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword', resetPassword);
router.get('/me', protect, getMe);

// Google OAuth
router.get('/google', (req, res, next) => {
    const role = req.query.role || 'customer';
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        state: JSON.stringify({ role })
    })(req, res, next);
});

router.get(
    '/google/callback',
    (req, res, next) => {
        passport.authenticate('google', { session: false }, (err, user, info) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                const message = info && info.message ? info.message : 'Authentication failed';
                return res.redirect(`http://localhost:5173/login?error=${encodeURIComponent(message)}`);
            }

            // Proceed with login
            const state = req.query.state ? JSON.parse(req.query.state) : {};
            const role = state.role || 'customer';
            const token = user.getSignedJwtToken();

            // Redirect to specialized routes instead of generic /login
            // This avoids "Welcome Back" messages and provides a smoother onboarding for new users
            let redirectUrl = `http://localhost:5173/?token=${token}`;
            if (role === 'seller') {
                redirectUrl = `http://localhost:5173/seller-setup?token=${token}&intent=seller`;
            }
            res.redirect(redirectUrl);
        })(req, res, next);
    }
);

module.exports = router;
