// Terminal link in the middleware chain — every thrown or rejected error
// from an async route handler lands here (Express forwards it
// automatically) and gets mapped to a status code exactly once. Must be
// registered last, after every router, in src/server.js.
export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error(err);
  return res.status(500).json({ error: 'internal server error' });
}
