// Import Mongoose for database modeling
const mongoose = require('mongoose');
// Import bcrypt for password hashing and comparison
const bcrypt = require('bcrypt');

// Define the User schema structure
const userSchema = new mongoose.Schema({
  // Email field: must be unique, required, lowercase, and trimmed of whitespace
  email: { type: String, unique: true, required: true, lowercase: true, trim: true },
  // Password field: required (will be stored as a hash)
  password: { type: String, required: true },
}, { timestamps: true });

// Pre-save middleware to hash the password before saving to the database
userSchema.pre('save', async function () {
  // If the password field hasn't been modified, skip hashing
  if (!this.isModified('password')) return;
  
  // Define the cost factor for hashing (higher is more secure but slower)
  const saltRounds = 12;
  // Hash the password using bcrypt
  this.password = await bcrypt.hash(this.password, saltRounds);
});

// Instance method to compare a candidate password with the stored hashed password
userSchema.methods.comparePassword = function (candidate) {
  // Returns a promise that resolves to true if passwords match, false otherwise
  return bcrypt.compare(candidate, this.password);
};

// Export the User model based on the schema
module.exports = mongoose.model('User', userSchema);
