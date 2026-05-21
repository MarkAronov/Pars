import { Logger } from '@nestjs/common';
import {
	WebSocketGateway,
	WebSocketServer,
	SubscribeMessage,
	MessageBody,
	ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/notifications', cors: { origin: process.env.CORS_ORIGIN, credentials: true } })
export class NotificationsGateway {
	@WebSocketServer() server!: Server;
	private readonly logger = new Logger(NotificationsGateway.name);

	@SubscribeMessage('join')
	handleJoin(@MessageBody() userId: string, @ConnectedSocket() client: Socket) {
		client.join(`user:${userId}`);
		this.logger.debug(`Client ${client.id} joined user:${userId}`);
	}

	sendToUser(userId: string, event: string, payload: unknown) {
		this.server.to(`user:${userId}`).emit(event, payload);
	}
}
