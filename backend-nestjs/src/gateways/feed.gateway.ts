import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import type { Server } from 'socket.io';

@WebSocketGateway({
	namespace: '/feed',
	cors: { origin: process.env.CORS_ORIGIN, credentials: true },
})
export class FeedGateway {
	@WebSocketServer() server!: Server;

	broadcastNewPost(post: unknown) {
		this.server.emit('new_post', post);
	}
}
