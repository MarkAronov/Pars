import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Patch,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';
import { SessionAuthGuard } from '../auth/guards/session.guard';
import type {
	PatchUserImportantDto,
	PatchUserPasswordDto,
	PatchUserRegularDto,
} from './user.dto';
import type { UserService } from './user.service';

interface AuthUser {
	id: string;
	role: string;
}

@ApiTags('users')
@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get()
	@ApiOperation({ summary: 'List all users' })
	findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
		return this.userService.findAll(Number(page), Number(limit));
	}

	@Get('me')
	@UseGuards(SessionAuthGuard)
	@ApiOperation({ summary: 'Get own profile' })
	getSelf(@CurrentUser() user: AuthUser) {
		return this.userService.findById(user.id);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get user by id or username' })
	findOne(@Param('id') id: string) {
		return this.userService.findByIdOrUsername(id);
	}

	@Patch('me')
	@UseGuards(SessionAuthGuard)
	@ApiOperation({ summary: 'Update display name / bio' })
	patchRegular(
		@CurrentUser() user: AuthUser,
		@Body() dto: PatchUserRegularDto,
	) {
		return this.userService.patchRegular(user.id, dto);
	}

	@Patch('me/important')
	@UseGuards(SessionAuthGuard)
	@ApiOperation({
		summary: 'Update username / email (requires current password)',
	})
	patchImportant(
		@CurrentUser() user: AuthUser,
		@Body() dto: PatchUserImportantDto,
	) {
		return this.userService.patchImportant(user.id, dto);
	}

	@Patch('me/password')
	@UseGuards(SessionAuthGuard)
	@ApiOperation({ summary: 'Change password' })
	patchPassword(
		@CurrentUser() user: AuthUser,
		@Body() dto: PatchUserPasswordDto,
	) {
		return this.userService.patchPassword(user.id, dto);
	}

	@Delete('me')
	@UseGuards(SessionAuthGuard)
	@ApiOperation({ summary: 'Delete own account' })
	deleteSelf(@CurrentUser() user: AuthUser) {
		return this.userService.deleteUser(user.id, user.id, user.role);
	}

	@Delete(':id')
	@UseGuards(SessionAuthGuard, RolesGuard)
	@Roles('admin')
	@ApiOperation({ summary: 'Admin: delete any user' })
	deleteUser(
		@CurrentUser() requester: AuthUser,
		@Param('id') targetId: string,
	) {
		return this.userService.deleteUser(requester.id, targetId, requester.role);
	}

	@Post(':id/follow')
	@HttpCode(200)
	@UseGuards(SessionAuthGuard)
	@ApiOperation({ summary: 'Follow a user' })
	follow(@CurrentUser() user: AuthUser, @Param('id') targetId: string) {
		return this.userService.follow(user.id, targetId);
	}

	@Delete(':id/follow')
	@UseGuards(SessionAuthGuard)
	@ApiOperation({ summary: 'Unfollow a user' })
	unfollow(@CurrentUser() user: AuthUser, @Param('id') targetId: string) {
		return this.userService.unfollow(user.id, targetId);
	}

	@Get(':id/followers')
	@ApiOperation({ summary: 'List followers of a user' })
	getFollowers(
		@Param('id') id: string,
		@Query('page') page = 1,
		@Query('limit') limit = 20,
	) {
		return this.userService.getFollowers(id, Number(page), Number(limit));
	}

	@Get(':id/following')
	@ApiOperation({ summary: 'List users that a user follows' })
	getFollowing(
		@Param('id') id: string,
		@Query('page') page = 1,
		@Query('limit') limit = 20,
	) {
		return this.userService.getFollowing(id, Number(page), Number(limit));
	}
}
