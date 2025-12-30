// Import dependencies, models, and services
const express = require('express');
const { auth } = require('../middleware/auth');
const Order = require('../models/Order');
const { ok, bad, notFound, serverError } = require('../utils/response');
const { isOtpVerified, clearVerifiedFlag } = require('../services/otpService');
const { clearOrdersCache } = require('../services/cacheService');

const router = express.Router();

// POST /api/payments/pay - Process payment for an order
router.post('/pay', auth, async (req, res) => {
  try {
    const { orderId } = req.body || {};
    if (!orderId) return bad(res, 'orderId is required');

    // Retrieve the order ensuring it belongs to the user
    const order = await Order.findOne({ _id: orderId, userId: req.userId });
    if (!order) return notFound(res, 'Order not found');

    // Ensure the order is in a valid state for payment
    if (order.status !== 'PENDING') {
      return bad(res, `Payment not allowed. Current status: ${order.status}`);
    }

    // CRITICAL: Check Redis to see if OTP was successfully verified recently
    // This prevents users from skipping the OTP step
    const verified = await isOtpVerified(req.userId, orderId);
    if (!verified) return bad(res, 'OTP not verified. Please verify OTP first.');

    // Mock payment logic based on requirements:
    // Amount <= 3000 succeeds, otherwise fails
    if (order.amount <= 3000) {
      order.status = 'PAID';
    } else {
      order.status = 'FAILED';
    }
    
    // Save the updated order status to MongoDB
    await order.save();

    // Cleanup:
    // 1. Remove the "verified" flag so it can't be reused for another attempt
    await clearVerifiedFlag(req.userId, orderId);
    // 2. Invalidate the user's order cache so the new status appears immediately
    await clearOrdersCache(req.userId);

    return ok(res, { message: 'Payment processed', order });
  } catch (err) {
    return serverError(res, err);
  }
});

module.exports = router;
