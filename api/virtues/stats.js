// Vercel serverless function for getting virtue statistics
const app = require('../../server/app');

module.exports = (req, res) => {
  // Set the request path to match the Express route
  req.url = '/api/virtues/stats';
  
  // Forward the request to the Express app
  return app(req, res);
};