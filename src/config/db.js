// Import the Mongoose library for MongoDB interactions
const mongoose = require('mongoose');

// Asynchronous function to establish a connection to the MongoDB database
async function connectDB() {
  // Retrieve the MongoDB connection string from environment variables
  const uri = process.env.MONGODB_URI;
  
  // Validate that the URI exists; if not, throw an error to stop execution
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }

  // Configure Mongoose to suppress the strictQuery deprecation warning
  // true: strict mode for query filters (filters must match schema)
  mongoose.set('strictQuery', true);

  // Attempt to connect to MongoDB using the provided URI
  // This awaits the promise to ensure connection before proceeding
  await mongoose.connect(uri);

  // Log a success message to the console once connected
  console.log('✅ MongoDB connected');
}

// Export the connectDB function so it can be used in the main application entry point
module.exports = { connectDB };
``
