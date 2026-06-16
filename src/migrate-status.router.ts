import { Router } from 'express';
import { migrateStatusController } from '@controllers/migrate-status.controller';

const router = Router();

router.get('/migrate-status', async (req, res) => {
  if (req.body && Object.keys(req.body).length) {
    return migrateStatusController.check(req, res, () => {});
  }

  const urls = req.query.urls;
  const host = req.query.host;
  req.body = {
    urls: typeof urls === 'string' ? urls.split(',').map((url) => url.trim()) : Array.isArray(urls) ? urls : [],
    host: typeof host === 'string' ? host : undefined,
  };

  return migrateStatusController.check(req, res, () => {});
});

router.post('/migrate-status', (req, res) => {
  return migrateStatusController.check(req, res, () => {});
});

export default router;
