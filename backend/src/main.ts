import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	// Security
	app.use(helmet());
	app.use(cookieParser());
	app.use(compression());

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
}

bootstrap();
