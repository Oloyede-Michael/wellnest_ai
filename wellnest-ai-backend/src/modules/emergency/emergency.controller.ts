import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator';
import { EmergencyService } from './emergency.service';
import { UpdateEmergencyDto } from './dto/update-emergency.dto';
import { CreateContactDto, UpdateContactDto } from './dto/contact.dto';

@ApiTags('Emergency Wallet')
@ApiBearerAuth()
@Controller('emergency')
export class EmergencyController {
  constructor(private readonly emergencyService: EmergencyService) {}

  @Get()
  @ApiOperation({ summary: 'Get the emergency health wallet' })
  async getWallet(@CurrentUserId() userId: string) {
    const data = await this.emergencyService.getWallet(userId);
    return { status: 'success', message: 'Emergency wallet', data };
  }

  @Patch()
  @ApiOperation({ summary: 'Update blood group, allergies, conditions, or medications summary' })
  async updateWallet(@CurrentUserId() userId: string, @Body() dto: UpdateEmergencyDto) {
    const data = await this.emergencyService.updateWallet(userId, dto);
    return { status: 'success', message: 'Emergency wallet updated', data };
  }

  @Post('contacts')
  @ApiOperation({ summary: 'Add an emergency contact' })
  async addContact(@CurrentUserId() userId: string, @Body() dto: CreateContactDto) {
    const data = await this.emergencyService.addContact(userId, dto);
    return { status: 'success', message: 'Contact added', data };
  }

  @Patch('contacts/:id')
  @ApiOperation({ summary: 'Update an emergency contact' })
  async updateContact(@CurrentUserId() userId: string, @Param('id') id: string, @Body() dto: UpdateContactDto) {
    const data = await this.emergencyService.updateContact(userId, id, dto);
    return { status: 'success', message: 'Contact updated', data };
  }

  @Delete('contacts/:id')
  @ApiOperation({ summary: 'Remove an emergency contact' })
  async removeContact(@CurrentUserId() userId: string, @Param('id') id: string) {
    const data = await this.emergencyService.removeContact(userId, id);
    return { status: 'success', message: 'Contact removed', data };
  }
}
