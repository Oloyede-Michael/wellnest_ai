import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalDocument } from '../database/entities/medical-document.entity';
import { HealthEvent } from '../database/entities/health-event.entity';
import { User } from '../database/entities/user.entity';
import { AiModule } from '../ai/ai.module';
import { MedicationsModule } from '../medications/medications.module';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalDocument, HealthEvent, User]), AiModule, MedicationsModule],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
