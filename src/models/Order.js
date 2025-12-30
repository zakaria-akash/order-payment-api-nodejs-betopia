// Import Mongoose for database modeling
const mongoose = require('mongoose');

// Define the Order schema structure
const orderSchema = new mongoose.Schema({
  // Reference to the User model (Foreign Key equivalent in MongoDB)
  // index: true optimizes queries filtering by userId
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  // The total amount for the order
  amount: { type: Number, required: true },
  // Order status with restricted values (enum)
  // Default is 'PENDING', index: true optimizes queries filtering by status
  status: { type: String, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING', index: true },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

// Export the Order model based on the schema
module.exports = mongoose.model('Order', orderSchema);
