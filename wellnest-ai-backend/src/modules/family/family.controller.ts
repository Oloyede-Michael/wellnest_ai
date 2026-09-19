import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator';
import { FamilyService } from './family.service';
import { InviteCaregiverDto } from './dto/invite-caregiver.dto';
import { UpdateAccessDto } from './dto/update-access.dto';
import { APP_CONSTANTS } from '../../config/constants';

@ApiTags('Family Care')
@ApiBearerAuth()
@Controller('family')
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Get()
  @ApiOperation({ summary: 'List caregivers supporting this patient' })
  async list(@CurrentUserId() userId: string) {
    const data = await this.familyService.list(userId);
    return { status: 'success', message: 'Family caregivers', data };
  }

  @Post('invite')
  @ApiOperation({ summary: 'Invite a caregiver by email' })
  async invite(@CurrentUserId() userId: string, @Body() dto: InviteCaregiverDto) {
    const data = await this.familyService.invite(userId, dto);
    return { status: 'success', message: APP_CONSTANTS.MESSAGES.INVITE_SENT, data };
  }

  @Patch(':id/access')
  @ApiOperation({ summary: 'Change a caregiver access level' })
  async updateAccess(@CurrentUserId() userId: string, @Param('id') id: string, @Body() dto: UpdateAccessDto) {
    const data = await this.familyService.updateAccess(userId, id, dto.accessLevel);
    return { status: 'success', message: 'Access updated', data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Revoke a caregiver' })
  async revoke(@CurrentUserId() userId: string, @Param('id') id: string) {
    const data = await this.familyService.revoke(userId, id);
    return { status: 'success', message: 'Caregiver removed', data };
  }
}
