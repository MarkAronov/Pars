import { resolve } from 'node:path';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import type Redis from 'ioredis';
import { AppModule } from './app.module';
import { REDIS_CLIENT } from './database/redis.module';
import { RedisIoAdapter } from './gateways/redis-io.adapter';

const bootstrap = async () => {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);

	// Security
	app.use(helmet());
	app.use(cookieParser());
	app.use(compression());

	// Cross-instance Socket.IO pub/sub — set once here for every namespaced
	// gateway, since a namespace's own afterInit() can't set the adapter itself.
	app.useWebSocketAdapter(
		new RedisIoAdapter(app, app.get<Redis>(REDIS_CLIENT)),
	);

	// CORS — credentials required for httpOnly cookie sessions
	app.enableCors({
		origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
		credentials: true,
	});

	// Global validation
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		}),
	);

	// Global prefix
	app.setGlobalPrefix('api');

	// Serve uploaded files from disk when using the local storage driver.
	// /media/* is intentionally outside /api to avoid the global prefix.
	if (process.env.STORAGE_DRIVER === 'local') {
		app.useStaticAssets(resolve(process.cwd(), 'media'), { prefix: '/media' });
	}

	// Swagger (dev only)
	if (process.env.NODE_ENV !== 'production') {
		const config = new DocumentBuilder()
			.setTitle('Pars API')
			.setDescription('Pars social media platform API')
			.setVersion('1.0')
			.addCookieAuth('better-auth.session_token')
			.build();
		const document = SwaggerModule.createDocument(app, config);
		SwaggerModule.setup('api/docs', app, document);
	}

	await app.listen(process.env.PORT ?? 3000);
};

bootstrap();
