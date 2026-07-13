import { Router } from 'express';

export function createAuditLogRouter(service) {
  const router = Router();

  router.get('/audit-log', async (req, res) => {
    const { entity_id: entityId, action, limit } = req.query;
    res.json(await service.listAuditLog({ entityId, action, limit }));
  });

  return router;
}
