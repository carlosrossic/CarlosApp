import { Injectable } from '@nestjs/common';
import { WAMonitoringService } from '@api/services/monitor.service';
import { PrismaRepository } from '@api/repository/repository.service';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import axios from 'axios';
import { pathToFileURL } from 'url';

@Injectable()
export class EvolutionBridgeService {
  private readonly url: string;
  private readonly token: string;
  private readonly instance: string;

  constructor(
    private readonly waMonitor: WAMonitoringService,
    private readonly prismaRepository: PrismaRepository,
    private readonly configService: ConfigService,
  ) {
    this.url = String(this.configService.get('EVOLUTION_API_URL') || '').replace(/\/$/, '');
    this.token = String(this.configService.get('EVOLUTION_API_TOKEN') || '');
    this.instance = String(this.configService.get('EVOLUTION_INSTANCE_NAME') || 'Carlos');
  }

  async enqueueWhatsApp(jid: string, text: string, suggested?: string) {
    const targetJid = jid || suggested || '';
    if (!/^\d+@s\.whatsapp\.net$/.test(targetJid)) return null;
    return this.sendText(targetJid, text);
  }

  async sendText(to: string, text: string) {
    const api = (this.waMonitor as any)?.waInstances?.[this.instance];
    if (!api) throw new Error(`Instance ${this.instance} not ready`);

    const response = await api.sendTextMessage({
      number: to.replace(/@s\.whatsapp\.net$/, ''),
      text,
    });

    return response || { status: 'sent' };
  }

  async listOutbox(): Promise<Array<{ id?: any; to?: any; text?: any; jid?: any; destination?: any }>> {
    const outboxPath = this.resolveQueuePath('outbox.json');
    try {
      const content = await this.readJsonFile<any[]>(outboxPath);
      return Array.isArray(content) ? content : [];
    } catch (err) {
      return [];
    }
  }

  async writeOutbox(payload: Array<any>) {
    const outboxPath = this.resolveQueuePath('outbox.json');
    await this.writeJsonFile(outboxPath, payload);
  }

  async pushInbox(item: any) {
    const inboxPath = this.resolveQueuePath('inbox.json');
    const list = await this.readJsonFile<any[]>(inboxPath);
    list.push(item);
    await this.writeJsonFile(inboxPath, list);
  }

  async readMappings() {
    const file = this.resolveQueuePath('mappings.json');
    try {
      const content = await this.readJsonFile(file);
      return content || { chats: {}, reverse: {} };
    } catch (err) {
      return { chats: {}, reverse: {} };
    }
  }

  async writeMappings(payload: any) {
    const file = this.resolveQueuePath('mappings.json');
    await this.writeJsonFile(file, payload);
  }

  private resolveQueuePath(relative: string) {
    const absolute = this.configService.get<string>('EVOLUTION_BRIDGE_QUEUE_DIR');
    if (!absolute) {
      return pathToFileURL(require('path').join(require('os').homedir(), '.evolution-bridge', relative)).href;
    }
    return pathToFileURL(require('path').join(absolute, relative)).href;
  }

  private async readJsonFile<T>(filePath: string): Promise<T> {
    const fs = await import('fs');
    if (!fs.existsSync(filePath)) return [] as unknown as T;
    const raw = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(raw || '[]');
  }

  private async writeJsonFile(filePath: string, payload: any) {
    const fs = await import('fs');
    await fs.promises.mkdir(require('path').dirname(filePath), { recursive: true });
    await fs.promises.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8');
  }
}
