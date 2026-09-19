import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from '../database/entities/chat-message.entity';
import { User } from '../database/entities/user.entity';
import { MedicationsService } from '../medications/medications.service';
import { AiAssistantMockService, AssistantContext } from '../ai/ai-assistant-mock.service';
import { generateChatMessageId } from '../../utils/id.util';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage) private readonly messageRepository: Repository<ChatMessage>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly medicationsService: MedicationsService,
    private readonly assistant: AiAssistantMockService,
  ) {}

  async getHistory(userId: string) {
    const existing = await this.messageRepository.find({ where: { user_id: userId }, order: { created_at: 'ASC' } });
    if (existing.length) return existing.map((m) => this.toDto(m));

    const context = await this.buildContext(userId);
    const greeting = await this.messageRepository.save(
      this.messageRepository.create({
        id: generateChatMessageId(),
        user_id: userId,
        role: 'assistant',
        text: context.diagnosis
          ? `Hi, I'm WellNest AI. I have full context of your health records — your latest labs, your medication plan, and your care team's notes. What would you like to understand today?`
          : `Hi, I'm WellNest AI. Upload a document or ask me anything once your records are in, and I'll help you understand your care plan.`,
      }),
    );
    return [this.toDto(greeting)];
  }

  async sendMessage(userId: string, text: string) {
    const userMessage = await this.messageRepository.save(
      this.messageRepository.create({ id: generateChatMessageId(), user_id: userId, role: 'user', text }),
    );

    const context = await this.buildContext(userId);
    const replyText = this.assistant.reply(text, context);
    const assistantMessage = await this.messageRepository.save(
      this.messageRepository.create({ id: generateChatMessageId(), user_id: userId, role: 'assistant', text: replyText }),
    );

    return [this.toDto(userMessage), this.toDto(assistantMessage)];
  }

  async getQuickPrompts(userId: string) {
    return this.assistant.quickPrompts(await this.buildContext(userId));
  }

  private async buildContext(userId: string): Promise<AssistantContext> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const schedule = await this.medicationsService.getSchedule(userId);
    const medicationNames = schedule.flatMap((block) => block.items.map((item) => item.name));
    return {
      diagnosis: user?.diagnosis,
      stage: user?.stage,
      medicationNames,
    };
  }

  private toDto(message: ChatMessage) {
    return { id: message.id, role: message.role, text: message.text, createdAt: message.created_at };
  }
}
