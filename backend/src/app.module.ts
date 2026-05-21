import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './database/prisma.module';
import { RedisModule } from './database/redis.module';
import { AuthModule } from './api/auth/auth.module';
import { UserModule } from './api/user/user.module';
import { PostModule } from './api/post/post.module';
import { ThreadModule } from './api/thread/thread.module';
import { TopicModule } from './api/topic/topic.module';
import { MediaModule } from './api/media/media.module';
import { SearchModule } from './api/search/search.module';
import { FeedModule } from './api/feed/feed.module';
import { MiscModule } from './api/misc/misc.module';
import { FeedGateway } from './gateways/feed.gateway';
import { NotificationsGateway } from './gateways/notifications.gateway';
import { PresenceGateway } from './gateways/presence.gateway';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
		PrismaModule,
		RedisModule,
		AuthModule,
		UserModule,
		PostModule,
		ThreadModule,
		TopicModule,
		MediaModule,
		SearchModule,
		FeedModule,
		MiscModule,
	],
	providers: [FeedGateway, NotificationsGateway, PresenceGateway],
})
export class AppModule {}
