import { IsEmail, IsOptional, IsString, Length, MinLength } from 'class-validator';

export class PatchUserRegularDto {
	@IsOptional()
	@IsString()
	@Length(1, 50)
	displayName?: string;

	@IsOptional()
	@IsString()
	@Length(0, 300)
	bio?: string;
}

export class PatchUserImportantDto {
	@IsOptional()
	@IsString()
	@Length(3, 30)
	username?: string;

	@IsOptional()
	@IsEmail()
	email?: string;

	@IsString()
	@MinLength(8)
	currentPassword!: string;
}

export class PatchUserPasswordDto {
	@IsString()
	@MinLength(8)
	currentPassword!: string;

	@IsString()
	@MinLength(8)
	newPassword!: string;
}
