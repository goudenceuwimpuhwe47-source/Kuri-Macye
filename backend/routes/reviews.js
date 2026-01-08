const express = require('express');
const {
    getReviews,
    addReview,
    deleteReview,
    getAllReviews
} = require('../controllers/reviewController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getAllReviews);
router.get('/product/:productId', getReviews);
router.post('/', protect, addReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
