import { Module, type OnModuleInit } from '@nestjs/common';
import { DrizzleModule } from '../../database/drizzle.module';
// biome-ignore lint/style/useImportType: NestJS DI token — runtime usage via emitDecoratorMetadata
import { DrizzleService } from '../../database/drizzle.service';
import { MongoModule } from '../../database/mongo.module';
// biome-ignore lint/style/useImportType: NestJS DI token — runtime usage via emitDecoratorMetadata
import { MongoService } from '../../database/mongo.service';
import { initAuth } from './auth.config';
import { AuthController } from './auth.controller';

@Module({
	// Explicit imports (not just relying on DrizzleModule/MongoModule being
	// @Global()) — this is what makes Nest guarantee both services'
	// onModuleInit() (which open the DB connection) complete before
	// AuthModule.onModuleInit() runs initAuth(), which reads drizzle.db /
	// mongo.db synchronously.
	imports: [DrizzleModule, MongoModule],
	controllers: [AuthController],
})
export class AuthModule implements OnModuleInit {
	constructor(
		private readonly drizzle: DrizzleService,
		private readonly mongo: MongoService,
	) {}

	onModuleInit() {
		initAuth(this.drizzle, this.mongo);
	}
}
