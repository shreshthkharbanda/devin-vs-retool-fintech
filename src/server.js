import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authMiddleware } from './middleware/auth.js';
import { actorMiddleware } from './middleware/actor.js';
import { errorHandler } from './middleware/error-handler.js';
import { KycCaseRepository } from './repositories/kyc-case-repository.js';
import { AuditLogRepository } from './repositories/audit-log-repository.js';
import { KycReviewService } from './services/kyc-review-service.js';
import { createKycCasesRouter } from './routes/kyc-cases.js';
import { createAuditLogRouter } from './routes/audit-log.js';

// Composition root: the one place concrete implementations get wired
// together. Everything downstream depends only on the shape it's handed,
// never on how these pieces were built.
const service = new KycReviewService({
  kycCaseRepository: new KycCaseRepository(),
  auditLogRepository: new AuditLogRepository(),
});

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', authMiddleware, actorMiddleware);
app.use('/api', createKycCasesRouter(service));
app.use('/api', createAuditLogRouter(service));

// Terminal link in the middleware chain — must be registered last.
app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`kyc-api listening on ${port}`));
