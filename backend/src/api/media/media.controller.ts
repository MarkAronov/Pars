import {
	Controller,
	Delete,
	Param,
	Post,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { SessionAuthGuard } from '../auth/guards/session.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { MediaService } from './media.service';

interface AuthUser { id: string; role: string }

@ApiTags('media')
@Controller('media')
export class MediaController {
	constructor(private readonly mediaService: MediaService) {}

	@Post('avatar')
	@UseGuards(SessionAuthGuard)
	@UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
	@ApiConsumes('multipart/form-data')
	uploadAvatar(@CurrentUser() user: AuthUser, @UploadedFile() file: Express.Multer.File) {
		return this.mediaService.uploadAvatar(user.id, file);
	}

	@Post('background')
	@UseGuards(SessionAuthGuard)
	@UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
	@ApiConsumes('multipart/form-data')
	uploadBackground(@CurrentUser() user: AuthUser, @UploadedFile() file: Express.Multer.File) {
		return this.mediaService.uploadBackground(user.id, file);
	}

	@Delete(':id')
	@UseGuards(SessionAuthGuard)
	deleteMedia(@Param('id') id: string, @CurrentUser() user: AuthUser) {
		return this.mediaService.deleteMedia(id, user.id);
	}
}
