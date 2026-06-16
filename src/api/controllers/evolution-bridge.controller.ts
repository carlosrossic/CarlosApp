import { v4 } from 'uuid';
import { EvolutionBridgeService } from '@api/services/evolution-bridge.service';
import { Database, Whatsapp, configService } from '@config/env.config';
import { Auth } from '@api/guards/auth.guard';
import { Logger } from '@config/logger.config';
import axios from 'axios';

export type Controller<T = any> = {
	create: (...args: any[]) => Promise<T>;
	find: (...args: any[]) => Promise<T | null>;
};

export class EvolutionBridgeController {
	private readonly logger = new Logger('EvolutionBridgeController');
	private readonly evoSvc: EvolutionBridgeService;

	constructor(private waMonitor: any, private prismaRepository: any, private configService: any) {
		this.evoSvc = new EvolutionBridgeService(configService, prismaRepository);
		this.waMonitor = waMonitor;
		this.prismaRepository = prismaRepository;
		this.configService = configService;
	}

	public async createEvolutionBridge(data: any) {
		const response = await this.waMonitor.waInstances[data.instanceName].createEvolutionBridge(data);
		return { bridge: { ...data, bridge: response } };
	}
}
