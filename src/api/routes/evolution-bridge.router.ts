import { Auth, configService } from '@config/env.config';
import { NextFunction, Request, Response, Router } from 'express';

import { EvolutionBridgeController } from '@controllers/evolution-bridge.controller';
import { instanceExistsGuard, instanceLoggedGuard } from '@api/guards/instance.guard';
import { authGuard } from '@api/guards/auth.guard';
import { waMonitor } from '@api/server.module';
import { prismaRepository } from '@api/server.module';

const router = Router();

router.get('/outbox', EvolutionBridgeController);

export default router;
