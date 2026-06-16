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
    const urls = Array.isArray(payload.urls) ? payload.urls : [];
    const host = typeof payload.host === 'string' ? payload.host : 'http://localhost:3000';

    if (!urls.length) {
      return res.status(400).json({ error: 'urls is required' });
    }

    const normalized = Array.from(new Set(urls.map((raw) => String(raw).trim()))).map((value) => {
      if (/^https?:\/\//i.test(value)) {
        return value;
      }
      const path = value.replace(/^\/+/, '');
      return path ? `/${path}` : '/';
    });

    const results: MigrationRecord[] = await Promise.all(
      normalized.map(async (url) => {
        const started = Date.now();
        try {
          const response = (await axios.get<unknown>(url, { timeout: 5000 })) as AxiosResponse<unknown>;
          return { url, status: response.status, elapsedMs: Date.now() - started };
        } catch (error) {
          const axiosError = error as AxiosError;
          const status = axiosError?.response?.status ?? 0;
          return {
            url,
            status,
            elapsedMs: Date.now() - started,
            error: axiosError?.message ?? 'Unknown error',
          };
        }
      }),
    );

    return res.json({ host, results });
  }
}

export const migrateStatusController = new MigrateStatusControllerImpl();
