import { Module } from '@nestjs/common';
import { ThreadController } from './thread.controller';

@Module({
	controllers: [ThreadController],
})
export class ThreadModule {}
