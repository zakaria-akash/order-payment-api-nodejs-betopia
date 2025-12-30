// Import the jsonwebtoken library to handle JWT verification
const jwt = require('jsonwebtoken');

// Middleware function to authenticate requests using JWT
function auth(req, res, next) {
  // Retrieve the Authorization header from the request, defaulting to an empty string if missing
  const header = req.headers.authorization || '';
  
  // Check if the header starts with 'Bearer ' and extract the token part
  // The standard format is "Bearer <token>"
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  // If no token is found, return a 401 Unauthorized response
  if (!token) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  try {
    // Verify the token using the secret key from environment variables
    // This throws an error if the token is invalid or expired
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach the userId from the token payload to the request object
    // This allows downstream route handlers to identify the logged-in user
    req.userId = payload.userId;
    
    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    // If verification fails, return a 401 Unauthorized response
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Export the auth middleware for use in protected routes
module.exports = { auth };
