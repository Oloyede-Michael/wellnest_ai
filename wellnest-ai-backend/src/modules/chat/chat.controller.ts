import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';

@ApiTags('Chat')
@ApiBearerAuth()
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('messages')
  @ApiOperation({ summary: 'Get chat history (seeds a greeting on first call)' })
  async getHistory(@CurrentUserId() userId: string) {
    const data = await this.chatService.getHistory(userId);
    return { status: 'success', message: 'Chat history', data };
  }

  @Post('messages')
  @ApiOperation({ summary: 'Ask WellNest AI a question' })
  async sendMessage(@CurrentUserId() userId: string, @Body() dto: SendMessageDto) {
    const data = await this.chatService.sendMessage(userId, dto.text);
    return { status: 'success', message: 'Reply generated', data };
  }

  @Get('quick-prompts')
  @ApiOperation({ summary: 'Get suggested quick-prompt chips' })
  async getQuickPrompts(@CurrentUserId() userId: string) {
    const data = await this.chatService.getQuickPrompts(userId);
    return { status: 'success', message: 'Quick prompts', data };
  }
}
