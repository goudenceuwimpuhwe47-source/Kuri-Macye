const express = require('express');
const {
    addOrderItems,
    getOrderById,
    getMyOrders,
    getOrders,
    updateOrderStatus,
    updateShippingStatus
} = require('../controllers/orderController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router
    .route('/')
    .post(addOrderItems)
    .get(authorize('seller', 'admin'), getOrders);

router.route('/myorders').get(getMyOrders);
router.route('/seller/my-orders').get(authorize('seller'), getOrders);

router.route('/:id').get(getOrderById);

router.route('/:id/status').put(authorize('admin'), updateOrderStatus);

router.route('/:id/shipping').put(authorize('seller', 'admin'), updateShippingStatus);

module.exports = router;
