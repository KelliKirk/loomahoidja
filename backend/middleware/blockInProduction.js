/**
 * Returns 404 in production so dev-only endpoints are not advertised.
 */
function blockInProduction(req, res, next) {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }
  next();
}

module.exports = blockInProduction;
