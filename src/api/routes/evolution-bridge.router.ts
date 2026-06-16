import { Router } from 'express';
import { EvolutionBridgeController } from '../controllers/evolution-bridge.controller';

export default class EvolutionBridgeRouter {
  router = Router();
  constructor() {
    this.router.get('/outbox', async (req, res) => {
      const controller = new EvolutionBridgeController({} as any, {} as any, {} as any);
      const result = await controller.createEvolutionBridge(req.body || {});
      res.json(result);
    });
  }
}
