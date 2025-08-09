// Vercel serverless function for updating virtue status
const app = require('../../../../server/app');

module.exports = (req, res) => {
  // Only allow PUT method
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  // Extract date from the filename pattern [date]-virtue
  const date = req.query.date;
  // Set the request path to match the Express route
  req.url = `/api/virtues/records/${date}/virtue`;
  
  // Forward the request to the Express app
  return app(req, res);
};