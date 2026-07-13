export function authMiddleware(req, res, next) {
  const key = req.header('X-Demo-Key');
  if (!key || key !== process.env.DEMO_API_KEY) {
    return res.status(401).json({ error: 'invalid or missing X-Demo-Key header' });
  }
  next();
}
