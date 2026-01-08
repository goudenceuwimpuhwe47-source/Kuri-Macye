const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const Order = require('../models/Order');
const axios = require('axios');

// @desc    Simulate MTN MoMo Payment
// @route   POST /api/payments/momo
// @access  Private
exports.payWithMoMo = asyncHandler(async (req, res, next) => {
    const { orderId, phoneNumber } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
        return next(new ErrorResponse('Order not found', 404));
    }

    // 1. Get Access Token
    // In production, you would cache this token
    const authString = Buffer.from(`${process.env.MTN_MOMO_API_USER}:${process.env.MTN_MOMO_API_KEY}`).toString('base64');

    try {
        const tokenResponse = await axios.post(
            'https://sandbox.momodeveloper.mtn.com/collection/token/',
            {},
            {
                headers: {
                    'Authorization': `Basic ${authString}`,
                    'Ocp-Apim-Subscription-Key': process.env.MTN_MOMO_PRIMARY_KEY
                }
            }
        );

        const accessToken = tokenResponse.data.access_token;

        // 2. Request to Pay
        const paymentUuid = require('crypto').randomUUID();
        const externalId = order._id.toString();

        await axios.post(
            'https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay',
            {
                amount: order.totalPrice.toString(),
                currency: 'EUR', // Sandbox only supports EUR usually, or XOF/UGX depending on config. Trying EUR first.
                // Note: For Rwandan Francs in production use 'RWF', but Sandbox often defaults to 'EUR'.
                externalId: externalId,
                payer: {
                    partyIdType: 'MSISDN',
                    partyId: phoneNumber
                },
                payerMessage: `Payment for Order ${orderId}`,
                payeeNote: 'Kuri-Macye'
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-Reference-Id': paymentUuid,
                    'X-Target-Environment': 'sandbox',
                    'Ocp-Apim-Subscription-Key': process.env.MTN_MOMO_PRIMARY_KEY
                }
            }
        );

        // 3. Update Order (Optimistic update for now or poll status)
        // For sandbox, we'll mark as pending and user checks status or we assume success for demo if no error.
        // Let's assume SUCCESS if the API call didn't throw.

        console.log(`MoMo Payment Initiated: ${paymentUuid}`);

        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentMethod = 'MoMo';
        order.orderStatus = 'PAID'; // In real app, might wait for webhook
        order.paymentResult = {
            id: paymentUuid,
            status: 'PENDING', // Sandbox requests are 'PENDING' then user 'approves'
            update_time: new Date().toISOString()
        };

        await order.save();

        res.status(200).json({
            success: true,
            data: order,
            message: 'Payment request sent. Please approve on your phone (Sandbox: use test numbers).'
        });

    } catch (error) {
        console.error('MoMo Payment Error:', error.response ? error.response.data : error.message);
        return next(new ErrorResponse('Payment Failed: ' + (error.response?.data?.message || error.message), 500));
    }
});

// @desc    Simulate Stripe/PayPal Payment
// @route   POST /api/payments/stripe
// @access  Private
exports.payWithStripe = asyncHandler(async (req, res, next) => {
    const { orderId, paymentId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
        return next(new ErrorResponse('Order not found', 404));
    }

    // Simulate Stripe payment verification
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentMethod = 'Stripe';
    order.orderStatus = 'PAID';
    order.paymentResult = {
        id: paymentId || `STRIPE-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        status: 'SUCCESS',
        update_time: new Date().toISOString()
    };

    await order.save();

    res.status(200).json({
        success: true,
        data: order
    });
});
