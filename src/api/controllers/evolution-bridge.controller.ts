import { Logger } from '../../config/logger.config';

export class EvolutionBridgeController {
	private readonly logger = new Logger('EvolutionBridgeController');

	constructor(private waMonitor: any, private prismaRepository: any, private readonly configService: any) {
		this.waMonitor = waMonitor;
		this.prismaRepository = prismaRepository;
		this.configService = configService;
	}

	public createEvolutionBridge(data: Record<string, unknown>) {
		return { bridge: { ...data } };
	}
}
