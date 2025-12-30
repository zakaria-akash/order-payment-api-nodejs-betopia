// Import dependencies and models
const express = require('express');
const Order = require('../models/Order');
const { auth } = require('../middleware/auth');
const { ok, created, bad, notFound, serverError } = require('../utils/response');
const { getCachedOrders, setCachedOrders } = require('../services/cacheService');

const router = express.Router();

// POST /api/orders - Create a new order
router.post('/', auth, async (req, res) => {
  try {
    const { amount } = req.body || {};
    // Validate amount is a positive number
    if (typeof amount !== 'number' || amount <= 0) return bad(res, 'amount must be a positive number');

    // Create order with default status 'PENDING' linked to the authenticated user
    const order = await Order.create({ userId: req.userId, amount, status: 'PENDING' });
    return created(res, order);
  } catch (err) {
    return serverError(res, err);
  }
});

// GET /api/orders/my - Retrieve logged-in user's orders (with Caching)
router.get('/my', auth, async (req, res) => {
  try {
    // 1. Attempt to fetch orders from Redis cache
    const cached = await getCachedOrders(req.userId);
    
    // 2. If cache hit, return cached data immediately
    if (cached) return ok(res, { source: 'cache', orders: cached });

    // 3. If cache miss, fetch from MongoDB (sorted by newest first)
    // .lean() converts Mongoose documents to plain JS objects for performance
    const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 }).lean();
    
    // 4. Store the result in Redis for future requests (TTL 60s)
    await setCachedOrders(req.userId, orders);
    
    return ok(res, { source: 'db', orders });
  } catch (err) {
    return serverError(res, err);
  }
});

// GET /api/orders/:id - Retrieve a specific order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    // Find order by ID and ensure it belongs to the requesting user
    const order = await Order.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!order) return notFound(res, 'Order not found');
    return ok(res, order);
  } catch (err) {
    return serverError(res, err);
  }
});

module.exports = router;
