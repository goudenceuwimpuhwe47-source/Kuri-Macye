const express = require('express');
const {
    getSellerProfile,
    updateSellerProfile,
    getSellers,
    updateSellerStatus,
    getUsers,
    updateUser
} = require('../controllers/sellerController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

// Seller routes
router
    .route('/profile')
    .get(authorize('seller'), getSellerProfile)
    .post(authorize('seller', 'customer'), upload.single('image'), updateSellerProfile);

// Admin routes
router.get('/', authorize('admin'), getSellers);
router.put('/:id/status', authorize('admin'), updateSellerStatus);

// User Management Admin
router.get('/users', authorize('admin'), getUsers);
router.put('/users/:id', authorize('admin'), updateUser);

module.exports = router;
