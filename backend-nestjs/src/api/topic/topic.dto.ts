import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateTopicDto {
	@IsNotEmpty()
	@IsString()
	@Length(1, 60)
	name!: string;

	@IsOptional()
	@IsString()
	@Length(0, 500)
	description?: string;
}

export class PatchTopicDto extends PartialType(CreateTopicDto) {}
