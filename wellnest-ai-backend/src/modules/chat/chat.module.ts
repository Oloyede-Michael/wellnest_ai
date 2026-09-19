import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessage } from '../database/entities/chat-message.entity';
import { User } from '../database/entities/user.entity';
import { MedicationsModule } from '../medications/medications.module';
import { AiModule } from '../ai/ai.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChatMessage, User]), MedicationsModule, AiModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
