// Simple test endpoint for debugging
module.exports = (req, res) => {
  res.status(200).json({
    message: 'Test endpoint working',
    method: req.method,
    url: req.url,
    query: req.query,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
};