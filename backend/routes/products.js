const express = require('express');
const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getRelatedProducts,
    getAdminProducts,
    getSellerProducts
} = require('../controllers/productController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/seller/my-products', protect, authorize('seller'), getSellerProducts);
router.get('/admin/all', protect, authorize('admin'), getAdminProducts);

router
    .route('/')
    .get(getProducts)
    .post(protect, authorize('seller', 'admin'), upload.single('image'), createProduct);

router
    .route('/:id')
    .get(getProduct)
    .put(protect, authorize('seller', 'admin'), upload.single('image'), updateProduct)
    .delete(protect, authorize('seller', 'admin'), deleteProduct);

router.get('/:id/related', getRelatedProducts);

module.exports = router;
