import type { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import type Redis from 'ioredis';
import type { ServerOptions } from 'socket.io';

// Namespaced gateways (e.g. @WebSocketGateway({ namespace: '/feed' })) receive the
// Namespace instance in afterInit(), not the root Server — Namespace.adapter is
// already an Adapter instance there, not the configurable method, so calling it per
// gateway throws. Setting the Redis adapter once here, on the actual root server
// this override returns, applies it to every namespace at once.
export class RedisIoAdapter extends IoAdapter {
	constructor(
		app: INestApplicationContext,
		private readonly redis: Redis,
	) {
		super(app);
	}

	createIOServer(port: number, options?: ServerOptions) {
		const server = super.createIOServer(port, options);
		const pub = this.redis.duplicate();
		const sub = this.redis.duplicate();
		server.adapter(createAdapter(pub, sub));
		return server;
	}
}
