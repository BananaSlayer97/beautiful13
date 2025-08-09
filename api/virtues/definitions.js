// Vercel serverless function for getting virtue definitions
const app = require('../../server/app');

module.exports = (req, res) => {
  // Set the request path to match the Express route
  req.url = '/api/virtues/definitions';
  
  // Forward the request to the Express app
  return app(req, res);
};