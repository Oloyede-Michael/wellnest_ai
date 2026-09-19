import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator';
import { TimelineService } from './timeline.service';

@ApiTags('Timeline')
@ApiBearerAuth()
@Controller()
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Get('timeline')
  @ApiOperation({ summary: 'Get the full health journey timeline' })
  async getTimeline(@CurrentUserId() userId: string) {
    const data = await this.timelineService.getTimeline(userId);
    return { status: 'success', message: 'Timeline', data };
  }

  @Get('activity/recent')
  @ApiOperation({ summary: 'Get the most recent activity items for the dashboard' })
  async getRecentActivity(@CurrentUserId() userId: string, @Query('limit') limit?: string) {
    const parsedLimit = limit ? Number(limit) : NaN;
    const data = await this.timelineService.getRecentActivity(
      userId,
      Number.isFinite(parsedLimit) ? parsedLimit : undefined,
    );
    return { status: 'success', message: 'Recent activity', data };
  }
}
