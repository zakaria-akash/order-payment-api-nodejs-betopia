// Import the createClient function from the redis package
const { createClient } = require('redis');

// Create a Redis client instance using the URL from environment variables
// This does not connect immediately; it just configures the client
const redis = createClient({
  url: process.env.REDIS_URL,
});

// Event listener for Redis errors
// This ensures that connection errors or runtime errors are logged instead of crashing the app silently
redis.on('error', (err) => {
  console.error('Redis Client Error', err);
});

// Asynchronous function to explicitly connect the Redis client
async function connectRedis() {
  // Check if the REDIS_URL environment variable is defined
  if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL is not set');
  }
  
  // Establish the connection to the Redis server
  await redis.connect();
  
  // Log success message upon successful connection
  console.log('✅ Redis connected');
}

// Export the redis client instance (for set/get operations) and the connect function (for startup)
module.exports = { redis, connectRedis };
``
