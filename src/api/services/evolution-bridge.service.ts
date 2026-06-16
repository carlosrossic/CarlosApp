import fs from 'fs/promises';
import path from 'path';
import { Logger } from '../../config/logger.config';

export type QueuedMessage = {
  jid?: string;
  text?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
};

const DEFAULT_DIR = path.resolve(process.cwd(), 'evolution-bridge');

export class EvolutionBridgeService {
  private readonly dataDir: string;
  private readonly logger = new Logger('EvolutionBridgeService');

  constructor(dataDir?: string) {
    this.dataDir = dataDir && dataDir.trim() ? path.resolve(dataDir) : DEFAULT_DIR;
  }

  async listOutbox(): Promise<QueuedMessage[]> {
    return this.readJson<QueuedMessage[]>('outbox-whatsapp.json');
  }

  async pushInbox(item: QueuedMessage) {
    const list = await this.readJson<QueuedMessage[]>('inbox.json');
    list.push(item);
    await this.writeJson('inbox.json', list);
  }

  async readMappings() {
    return this.readJson<Record<string, unknown>>('mappings.json');
  }

  private resolvePath(relative: string) {
    return path.join(this.dataDir, relative);
  }

  private async readJson<T>(relative: string): Promise<T> {
    const filePath = this.resolvePath(relative);
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      return JSON.parse(raw || '[]') as T;
    } catch (error) {
      const err = error as any;
      const code = typeof err?.code === 'string' ? err.code : null;
      const notFound = code === 'ENOENT';
      if (notFound) {
        return [] as unknown as T;
      }
      throw error;
    }
  }

  private async writeJson(relative: string, data: unknown) {
    const filePath = this.resolvePath(relative);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const tmp = `${filePath}.tmp-${Date.now()}`;
    const content = JSON.stringify(data, null, 2);
    await fs.writeFile(tmp, content, 'utf8');
    await fs.rename(tmp, filePath);
  }
}
