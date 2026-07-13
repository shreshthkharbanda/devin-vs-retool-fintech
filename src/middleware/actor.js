export function actorMiddleware(req, res, next) {
  const actor = req.header('X-Reviewer-Email');
  if (!actor) {
    return res.status(400).json({ error: 'X-Reviewer-Email header is required' });
  }
  req.actor = actor;
  next();
}
