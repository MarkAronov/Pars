import { Module, type OnModuleInit } from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS DI token — runtime usage via emitDecoratorMetadata
import { DrizzleService } from '../../database/drizzle.service';
import { initAuth } from './auth.config';
import { AuthController } from './auth.controller';

@Module({
	controllers: [AuthController],
})
export class AuthModule implements OnModuleInit {
	constructor(private readonly drizzle: DrizzleService) {}

	onModuleInit() {
		initAuth(this.drizzle);
	}
}
