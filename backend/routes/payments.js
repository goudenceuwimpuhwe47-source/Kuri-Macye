const express = require('express');
const {
    payWithMoMo,
    payWithStripe
} = require('../controllers/paymentController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/momo', payWithMoMo);
router.post('/stripe', payWithStripe);

module.exports = router;
