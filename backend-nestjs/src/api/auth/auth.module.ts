import { Module, type OnModuleInit } from '@nestjs/common';
import { DrizzleModule } from '../../database/drizzle.module';
// biome-ignore lint/style/useImportType: NestJS DI token — runtime usage via emitDecoratorMetadata
import { DrizzleService } from '../../database/drizzle.service';
import { initAuth } from './auth.config';
import { AuthController } from './auth.controller';

@Module({
	// Explicit import (not just relying on DrizzleModule being @Global()) —
	// this is what makes Nest guarantee DrizzleService.onModuleInit() (which
	// opens the DB connection) completes before AuthModule.onModuleInit()
	// runs initAuth(), which reads drizzle.db synchronously.
	imports: [DrizzleModule],
	controllers: [AuthController],
})
export class AuthModule implements OnModuleInit {
	constructor(private readonly drizzle: DrizzleService) {}

	onModuleInit() {
		initAuth(this.drizzle);
	}
}
