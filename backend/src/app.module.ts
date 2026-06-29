import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './api/auth/auth.module';
import { FeedModule } from './api/feed/feed.module';
import { MediaModule } from './api/media/media.module';
import { MiscModule } from './api/misc/misc.module';
import { PostModule } from './api/post/post.module';
import { SearchModule } from './api/search/search.module';
import { ThreadModule } from './api/thread/thread.module';
import { TopicModule } from './api/topic/topic.module';
import { UserModule } from './api/user/user.module';
import { DrizzleModule } from './database/drizzle.module';
import { RedisModule } from './database/redis.module';
import { FeedGateway } from './gateways/feed.gateway';
import { NotificationsGateway } from './gateways/notifications.gateway';
import { PresenceGateway } from './gateways/presence.gateway';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
		DrizzleModule,
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
