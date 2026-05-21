import { Controller, Get } from '@nestjs/common';

@Controller()
export class MiscController {
	@Get('health')
	health() {
		return { status: 'ok', timestamp: new Date().toISOString() };
	}
}
