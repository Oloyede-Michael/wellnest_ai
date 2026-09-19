import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get the current user dashboard profile' })
  async getMe(@CurrentUserId() userId: string) {
    const data = await this.usersService.getDashboardProfile(userId);
    return { status: 'success', message: 'Profile', data };
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update diagnosis, stage, and next appointment' })
  async updateMe(@CurrentUserId() userId: string, @Body() dto: UpdateProfileDto) {
    const data = await this.usersService.updateProfile(userId, dto);
    return { status: 'success', message: 'Profile updated', data };
  }

  @Get('me/vitals')
  @ApiOperation({ summary: 'Get latest recorded vitals' })
  async getVitals(@CurrentUserId() userId: string) {
    const data = await this.usersService.getVitals(userId);
    return { status: 'success', message: 'Vitals', data };
  }

  @Get('me/preferences')
  @ApiOperation({ summary: 'Get notification/security preferences' })
  async getPreferences(@CurrentUserId() userId: string) {
    const data = await this.usersService.getPreferences(userId);
    return { status: 'success', message: 'Preferences', data };
  }

  @Patch('me/preferences')
  @ApiOperation({ summary: 'Update notification/security preferences' })
  async updatePreferences(@CurrentUserId() userId: string, @Body() dto: UpdatePreferencesDto) {
    const data = await this.usersService.updatePreferences(userId, dto);
    return { status: 'success', message: 'Preferences updated', data };
  }
}
