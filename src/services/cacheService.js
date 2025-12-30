// Import the redis client instance from configuration
const { redis } = require('../config/redis');

// Define the Time-To-Live (TTL) for cached orders in seconds (1 minute)
const ORDERS_CACHE_TTL = 60;

// Helper function to generate a unique Redis key for a user's order list
function ordersCacheKey(userId) {
  return `orders:my:${userId}`;
}

// Function to retrieve cached orders for a specific user
async function getCachedOrders(userId) {
  // Fetch data from Redis using the generated key
  const data = await redis.get(ordersCacheKey(userId));
  // If data exists, parse the JSON string back to an object; otherwise return null
  return data ? JSON.parse(data) : null;
}

// Function to store user orders in the cache
async function setCachedOrders(userId, orders) {
  // Save the orders array as a JSON string in Redis
  // 'EX' sets the expiration time in seconds to ensure cache freshness
  await redis.set(ordersCacheKey(userId), JSON.stringify(orders), { EX: ORDERS_CACHE_TTL });
}

// Function to invalidate/remove the cached orders for a user
// This is typically called after a new order is created or status changes
async function clearOrdersCache(userId) {
  await redis.del(ordersCacheKey(userId));
}

// Export the service functions for use in controllers/routes
module.exports = { getCachedOrders, setCachedOrders, clearOrdersCache };
