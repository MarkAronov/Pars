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

export class PatchPostDto {
	@IsOptional()
	@IsString()
	title?: string;

	@IsOptional()
	@IsString()
	content?: string;

	@IsOptional()
	@IsString()
	threadId?: string;
}
