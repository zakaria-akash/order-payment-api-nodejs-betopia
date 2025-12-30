// Load environment variables from .env file immediately
require('dotenv').config();

// Import core dependencies
const express = require('express');
const cors = require('cors');       // Cross-Origin Resource Sharing
const morgan = require('morgan');   // HTTP request logger

// Import database connection functions
const { connectDB } = require('./config/db');
const { connectRedis } = require('./config/redis');

// Import route handlers
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const otpRoutes = require('./routes/otp');
const paymentRoutes = require('./routes/payments');

// Initialize the Express application
const app = express();

// Apply global middleware
app.use(cors());          // Enable CORS for all routes
app.use(express.json());  // Parse incoming JSON payloads
app.use(morgan('dev'));   // Log HTTP requests to the console

// Define a simple root route to check API health
app.get('/', (req, res) => res.json({ status: 'OK', message: 'Order & Payment API' }));

// Mount route groups
app.use('/auth', authRoutes);
app.use('/orders', orderRoutes);
app.use('/otp', otpRoutes);
app.use('/payments', paymentRoutes);

// Global error fallback (already handled in routes, but this is a catch-all)
// This catches any errors thrown synchronously or passed to next(err) that weren't caught elsewhere
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Define the port, defaulting to 4000 if not specified in env
const port = process.env.PORT || 4000;

// Start the server asynchronously to ensure DB connections are established first
(async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    // Connect to Redis
    await connectRedis();
    
    // Start listening for requests
    app.listen(port, () => console.log(`🚀 Server running on http://localhost:${port}`));
  } catch (err) {
    // Log startup errors and exit the process with failure code
    console.error('Startup error:', err);
    process.exit(1);
  }
})();
``
