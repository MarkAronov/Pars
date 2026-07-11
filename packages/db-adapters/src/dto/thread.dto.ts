import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateThreadDto {
	@IsNotEmpty()
	@IsString()
	title!: string;

	@IsNotEmpty()
	@IsString()
	topicId!: string;
}

export class PatchThreadDto {
	@IsOptional()
	@IsString()
	title?: string;

	@IsOptional()
	@IsString()
	topicId?: string;
}
