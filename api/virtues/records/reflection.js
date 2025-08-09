// Vercel serverless function for updating daily reflection
const app = require('../../../../server/app');

module.exports = (req, res) => {
  // Extract date from the filename pattern [date]-reflection
  const date = req.query.date;
  // Set the request path to match the Express route
  req.url = `/api/virtues/records/${date}/reflection`;
  
  // Forward the request to the Express app
  return app(req, res);
};