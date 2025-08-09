// Vercel serverless function for getting virtue records by week
const app = require('../../../../../server/app');

module.exports = (req, res) => {
  // Set the request path to match the Express route
  req.url = `/api/virtues/records/week/${req.query.year}/${req.query.week}`;
  
  // Forward the request to the Express app
  return app(req, res);
};