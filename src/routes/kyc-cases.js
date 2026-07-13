import { Router } from 'express';

// Thin HTTP adapter: parse the request, delegate to the injected service,
// shape the response. No business logic and no repository/database access
// lives here — that's the whole point of the layer underneath.
export function createKycCasesRouter(service) {
  const router = Router();

  router.get('/kyc-cases', async (req, res) => {
    res.json(await service.listCases({ entityType: req.query.entity_type }));
  });

  router.get('/kyc-cases/:id', async (req, res) => {
    res.json(await service.viewCase(req.params.id, req.actor));
  });

  router.post('/kyc-cases/:id/approve', async (req, res) => {
    res.json(await service.decide('approve', req.params.id, req.actor, req.body));
  });

  router.post('/kyc-cases/:id/reject', async (req, res) => {
    res.json(await service.decide('reject', req.params.id, req.actor, req.body));
  });

  router.post('/kyc-cases/:id/escalate', async (req, res) => {
    res.json(await service.decide('escalate', req.params.id, req.actor, req.body));
  });

  return router;
}
