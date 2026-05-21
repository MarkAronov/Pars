import { Inject, Logger } from '@nestjs/common';
import {
	WebSocketGateway,
	WebSocketServer,
	OnGatewayInit,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import type Redis from 'ioredis';
import { REDIS_CLIENT } from '../database/redis.module';

@WebSocketGateway({ namespace: '/feed', cors: { origin: process.env.CORS_ORIGIN, credentials: true } })
export class FeedGateway implements OnGatewayInit {
	@WebSocketServer() server!: Server;
	private readonly logger = new Logger(FeedGateway.name);

	constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

	afterInit(server: Server) {
		const pub = this.redis.duplicate();
		const sub = this.redis.duplicate();
		server.adapter(createAdapter(pub, sub));
		this.logger.log('FeedGateway initialized with Redis adapter');
	}

	broadcastNewPost(post: unknown) {
		this.server.emit('new_post', post);
	}
}
