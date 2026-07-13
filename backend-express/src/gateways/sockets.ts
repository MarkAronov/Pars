import type { Server as HttpServer } from 'node:http';
import { createAdapter } from '@socket.io/redis-adapter';
import type Redis from 'ioredis';
import { Server, type Socket } from 'socket.io';

const PRESENCE_TTL = 300; // seconds

// Mirrors backend-nestjs/src/gateways/{feed,notifications,presence}.gateway.ts
// and redis-io.adapter.ts — three namespaces on one server, sharing one Redis
// pub/sub adapter for cross-instance broadcast. Neither backend currently has
// a REST action wired to trigger feed/notification broadcasts (confirmed via
// grep against backend-nestjs — the gateways exist but nothing calls them
// yet); this ports the same standalone namespace setup, not new behavior.
export interface SocketGateways {
	io: Server;
	broadcastNewPost: (post: unknown) => void;
	sendToUser: (userId: string, event: string, payload: unknown) => void;
}

export const attachSockets = (
	httpServer: HttpServer,
	redis: Redis,
): SocketGateways => {
	const io = new Server(httpServer, {
		cors: { origin: process.env.CORS_ORIGIN, credentials: true },
	});

	const pub = redis.duplicate();
	const sub = redis.duplicate();
	io.adapter(createAdapter(pub, sub));

	const feedNs = io.of('/feed');

	const notificationsNs = io.of('/notifications');
	notificationsNs.on('connection', (client: Socket) => {
		client.on('join', (userId: string) => {
			client.join(`user:${userId}`);
		});
	});

	const presenceNs = io.of('/presence');
	presenceNs.on('connection', async (client: Socket) => {
		const userId = client.handshake.auth?.userId as string | undefined;
		if (userId) {
			await redis.setex(`presence:${userId}`, PRESENCE_TTL, '1');
			presenceNs.emit('user_online', { userId });
		}

		client.on('disconnect', async () => {
			if (!userId) return;
			await redis.del(`presence:${userId}`);
			presenceNs.emit('user_offline', { userId });
		});
	});

	return {
		io,
		broadcastNewPost: (post: unknown) => feedNs.emit('new_post', post),
		sendToUser: (userId: string, event: string, payload: unknown) =>
			notificationsNs.to(`user:${userId}`).emit(event, payload),
	};
};
