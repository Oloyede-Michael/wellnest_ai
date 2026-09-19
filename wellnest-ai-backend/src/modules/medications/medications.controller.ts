import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator';
import { MedicationsService } from './medications.service';
import { ToggleTakenDto } from './dto/toggle-taken.dto';
import { APP_CONSTANTS } from '../../config/constants';

@ApiTags('Medications')
@ApiBearerAuth()
@Controller('medications')
export class MedicationsController {
  constructor(private readonly medicationsService: MedicationsService) {}

  @Get()
  @ApiOperation({ summary: "Get today's medication schedule" })
  async getSchedule(@CurrentUserId() userId: string) {
    const data = await this.medicationsService.getSchedule(userId);
    return { status: 'success', message: 'Medication schedule', data };
  }

  @Get('adherence/week')
  @ApiOperation({ summary: 'Get the last 7 days of medication adherence' })
  async getWeekAdherence(@CurrentUserId() userId: string) {
    const data = await this.medicationsService.getWeekAdherence(userId);
    return { status: 'success', message: 'Weekly adherence', data };
  }

  @Patch('blocks/:blockId/active')
  @ApiOperation({ summary: 'Toggle reminders on/off for a time-of-day block' })
  async toggleBlockActive(@CurrentUserId() userId: string, @Param('blockId') blockId: string) {
    const data = await this.medicationsService.toggleBlockActive(userId, blockId);
    return { status: 'success', message: APP_CONSTANTS.MESSAGES.MEDICATION_UPDATED, data };
  }

  @Patch('items/:itemId/taken')
  @ApiOperation({ summary: 'Toggle a medication item as taken/not taken for a given day' })
  async toggleItemTaken(
    @CurrentUserId() userId: string,
    @Param('itemId') itemId: string,
    @Body() dto: ToggleTakenDto,
  ) {
    const data = await this.medicationsService.toggleItemTaken(userId, itemId, dto.date);
    return { status: 'success', message: APP_CONSTANTS.MESSAGES.MEDICATION_UPDATED, data };
  }
}
