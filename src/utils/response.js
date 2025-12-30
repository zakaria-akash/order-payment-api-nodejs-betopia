// Helper for 200 OK responses
function ok(res, data) {
  return res.status(200).json(data);
}

// Helper for 201 Created responses (e.g., after registration or order creation)
function created(res, data) {
  return res.status(201).json(data);
}

// Helper for 400 Bad Request (client errors like missing fields)
function bad(res, msg = 'Bad request') {
  return res.status(400).json({ error: msg });
}

// Helper for 401 Unauthorized (authentication failures)
function unauthorized(res, msg = 'Unauthorized') {
  return res.status(401).json({ error: msg });
}

// Helper for 403 Forbidden (authenticated but permissions denied)
function forbidden(res, msg = 'Forbidden') {
  return res.status(403).json({ error: msg });
}

// Helper for 404 Not Found (resource doesn't exist)
function notFound(res, msg = 'Not found') {
  return res.status(404).json({ error: msg });
}

// Helper for 500 Internal Server Error (unexpected crashes/exceptions)
function serverError(res, err) {
  // Log the actual error to the console for debugging
  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
}

// Export all helpers for use in controllers/routes
module.exports = { ok, created, bad, unauthorized, forbidden, notFound, serverError };
