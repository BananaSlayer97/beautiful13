// Vercel serverless function for updating daily reflection
const app = require('../../../../server/app');

module.exports = (req, res) => {
  // Set the request path to match the Express route
  req.url = `/api/virtues/records/${req.query.date}/reflection`;
  
  // Forward the request to the Express app
  return app(req, res);
};