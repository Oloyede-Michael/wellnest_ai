import { Module } from '@nestjs/common';
import { OcrMockService } from './ocr-mock.service';
import { MedicalNlpMockService } from './medical-nlp-mock.service';
import { DiagnosisTranslatorService } from './diagnosis-translator.service';
import { MedicationScheduleBuilderService } from './medication-schedule-builder.service';
import { AiAssistantMockService } from './ai-assistant-mock.service';
import { AiController } from './ai.controller';

/** Shared mock AI/OCR/NLP services (PRD section 14) consumed by documents, medications, and chat modules. */
@Module({
  controllers: [AiController],
  providers: [
    OcrMockService,
    MedicalNlpMockService,
    DiagnosisTranslatorService,
    MedicationScheduleBuilderService,
    AiAssistantMockService,
  ],
  exports: [
    OcrMockService,
    MedicalNlpMockService,
    DiagnosisTranslatorService,
    MedicationScheduleBuilderService,
    AiAssistantMockService,
  ],
})
export class AiModule {}
