import { Request, Response, NextFunction } from 'express';
import axios, { AxiosError, AxiosResponse } from 'axios';

type MigrationRecord = {
  url: string;
  status: number;
  elapsedMs: number;
  error?: string;
};

type MigrateStatusController = {
  check: (req: Request, res: Response, next: NextFunction) => Promise<Response>;
};

class MigrateStatusControllerImpl implements MigrateStatusController {
  public async check(req: Request, res: Response, _next: NextFunction): Promise<Response> {
    const payload = req.body || {};
    const urls = Array.isArray(payload.urls) ? (payload.urls as any[]).map((item) => String(item)) : [];
    const host = typeof payload.host === 'string' ? payload.host : 'http://localhost:3000';

    if (!urls.length) {
      return res.status(400).json({ error: 'urls is required' });
    }

    const normalized = Array.from(new Set(urls.map((raw) => raw.trim()))).map((value: string) => {
      if (/^https?:\/\//i.test(value)) {
        return value;
      }
      const pathValue = value.replace(/^\/+/, '');
      return pathValue ? `/${pathValue}` : '/';
    });

    const results: MigrationRecord[] = await Promise.all(
      normalized.map(async (url: string) => {
        const started = Date.now();
        try {
          const response = await axios.get(url, { timeout: 5000 });
          return { url, status: response.status, elapsedMs: Date.now() - started };
        } catch (error) {
          const axiosError = error as any;
          const status = (axiosError?.response?.status as number | undefined) ?? 0;
          return {
            url,
            status,
            elapsedMs: Date.now() - started,
            error: typeof axiosError?.message === 'string' ? axiosError.message : 'Unknown error',
          };
        }
      }),
    );

    return res.json({ host, results });
  }
}

export const migrateStatusController = new MigrateStatusControllerImpl();
