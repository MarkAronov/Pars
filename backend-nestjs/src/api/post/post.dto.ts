import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
	@IsOptional()
	@IsString()
	title?: string;

	@IsNotEmpty()
	@IsString()
	content!: string;

	@IsOptional()
	@IsString()
	threadId?: string;
}

export class PatchPostDto extends PartialType(CreatePostDto) {}
