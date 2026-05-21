import { Inject, Logger } from '@nestjs/common';
import {
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import type Redis from 'ioredis';
import { REDIS_CLIENT } from '../database/redis.module';

const PRESENCE_TTL = 300; // seconds

@WebSocketGateway({ namespace: '/presence', cors: { origin: process.env.CORS_ORIGIN, credentials: true } })
export class PresenceGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server!: Server;
	private readonly logger = new Logger(PresenceGateway.name);

	constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

	async handleConnection(client: Socket) {
		const userId = client.handshake.auth?.userId as string | undefined;
		if (!userId) return;
		await this.redis.setex(`presence:${userId}`, PRESENCE_TTL, '1');
		this.server.emit('user_online', { userId });
		this.logger.debug(`User ${userId} online`);
	}

	async handleDisconnect(client: Socket) {
		const userId = client.handshake.auth?.userId as string | undefined;
		if (!userId) return;
		await this.redis.del(`presence:${userId}`);
		this.server.emit('user_offline', { userId });
		this.logger.debug(`User ${userId} offline`);
	}
}
