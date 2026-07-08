import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateThreadDto {
	@IsNotEmpty()
	@IsString()
	title!: string;

	@IsNotEmpty()
	@IsString()
	topicId!: string;
}

export class PatchThreadDto extends PartialType(CreateThreadDto) {}
