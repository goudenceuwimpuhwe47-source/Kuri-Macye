const express = require('express');
const {
    getCart,
    addItemToCart,
    updateCartItem,
    removeCartItem
} = require('../controllers/cartController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.use(protect);

router
    .route('/')
    .get(getCart)
    .post(addItemToCart);

router
    .route('/:id')
    .put(updateCartItem)
    .delete(removeCartItem);

module.exports = router;
