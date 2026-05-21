import { Module, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuthController } from './auth.controller';
import { initAuth } from './auth.config';

@Module({
	controllers: [AuthController],
})
export class AuthModule implements OnModuleInit {
	constructor(private readonly prisma: PrismaService) {}

	onModuleInit() {
		initAuth(this.prisma);
	}
}
