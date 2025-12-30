// Import dependencies, models, and services
const express = require('express');
const { auth } = require('../middleware/auth');
const Order = require('../models/Order');
const User = require('../models/User');
const { ok, bad, notFound, serverError } = require('../utils/response');
const { requestOtp, verifyOtp } = require('../services/otpService');

const router = express.Router();

// POST /api/otp/request - Generate and email an OTP for a specific order
router.post('/request', auth, async (req, res) => {
  try {
    const { orderId } = req.body || {};
    if (!orderId) return bad(res, 'orderId is required');

    // Verify the order exists and belongs to the user
    const order = await Order.findOne({ _id: orderId, userId: req.userId });
    if (!order) return notFound(res, 'Order not found');
    
    // Ensure OTP is only requested for orders that haven't been paid yet
    if (order.status !== 'PENDING') return bad(res, 'OTP can only be requested for PENDING orders');

    // Fetch user details to get the email address
    const user = await User.findById(req.userId);
    
    // Call service to generate OTP, store in Redis, and send email
    await requestOtp(req.userId, orderId, user.email);

    // Respond to client (Note: OTP code is NOT returned here for security)
    return ok(res, { message: 'OTP sent to your Gmail. Valid for 2 minutes.' });
  } catch (err) {
    return serverError(res, err);
  }
});

// POST /api/otp/verify - Validate the OTP provided by the user
router.post('/verify', auth, async (req, res) => {
  try {
    const { orderId, otp } = req.body || {};
    if (!orderId || !otp) return bad(res, 'orderId and otp are required');

    // Verify order existence and ownership
    const order = await Order.findOne({ _id: orderId, userId: req.userId });
    if (!order) return notFound(res, 'Order not found');
    
    // Ensure order is still pending
    if (order.status !== 'PENDING') return bad(res, 'Order is not pending');

    // Call service to verify the OTP code against Redis
    const result = await verifyOtp(req.userId, orderId, otp);
    
    // If verification failed (expired or incorrect), return error
    if (!result.ok) return bad(res, result.reason);

    // If successful, the service has set a "verified" flag in Redis
    return ok(res, { message: 'OTP verified. You may proceed to payment.' });
  } catch (err) {
    return serverError(res, err);
  }
});

module.exports = router;
``
