import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalDocument } from '../database/entities/medical-document.entity';
import { HealthEvent } from '../database/entities/health-event.entity';
import { User } from '../database/entities/user.entity';
import { OcrMockService } from '../ai/ocr-mock.service';
import { MedicalNlpMockService } from '../ai/medical-nlp-mock.service';
import { MedicationScheduleBuilderService } from '../ai/medication-schedule-builder.service';
import { MedicationsService } from '../medications/medications.service';
import { generateDocumentId, generateEventId } from '../../utils/id.util';
import { fullDateLabel } from '../../utils/date.util';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(MedicalDocument) private readonly documentRepository: Repository<MedicalDocument>,
    @InjectRepository(HealthEvent) private readonly healthEventRepository: Repository<HealthEvent>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly ocrService: OcrMockService,
    private readonly nlpService: MedicalNlpMockService,
    private readonly scheduleBuilder: MedicationScheduleBuilderService,
    private readonly medicationsService: MedicationsService,
  ) {}

  async uploadAndAnalyze(userId: string, files: Array<{ originalname: string }>) {
    const results = [];
    for (const file of files) {
      results.push(await this.analyzeOne(userId, file.originalname));
    }
    return results;
  }

  async list(userId: string) {
    const docs = await this.documentRepository.find({ where: { user_id: userId }, order: { created_at: 'DESC' } });
    return docs.map((d) => this.toSummary(d));
  }

  async getById(userId: string, id: string) {
    const doc = await this.documentRepository.findOne({ where: { id, user_id: userId } });
    if (!doc) throw new NotFoundException('Document not found');
    return {
      ...this.toSummary(doc),
      extractedDiagnosis: doc.extracted_diagnosis ?? null,
      extractedSummary: doc.extracted_summary ?? null,
      followUpRecommendations: doc.follow_up_recommendations ?? null,
    };
  }

  private async analyzeOne(userId: string, originalFilename: string) {
    const ocr = this.ocrService.extractText(originalFilename);
    const extraction = this.nlpService.extract(ocr.text);

    const document = await this.documentRepository.save(
      this.documentRepository.create({
        id: generateDocumentId(),
        user_id: userId,
        name: originalFilename.replace(/\.[^/.]+$/, ''),
        type: ocr.typeHint,
        status: 'Analyzed',
        pages: 1,
        original_filename: originalFilename,
        extracted_diagnosis: extraction.diagnosis ?? undefined,
        extracted_summary: extraction.diagnosisExplanation ?? extraction.summary,
        follow_up_recommendations: extraction.followUpRecommendations,
      }),
    );

    if (extraction.medications.length) {
      const blocks = this.scheduleBuilder.buildBlocks(extraction.medications);
      await this.medicationsService.mergeExtractedBlocks(userId, document.id, blocks);
    }

    if (extraction.diagnosis) {
      await this.applyDiagnosisIfUnset(userId, extraction.diagnosis);
    }

    await this.healthEventRepository.save(
      this.healthEventRepository.create({
        id: generateEventId(),
        user_id: userId,
        kind: 'document',
        title: `${document.name} uploaded`,
        detail: extraction.summary,
      }),
    );

    return {
      ...this.toSummary(document),
      extractedDiagnosis: extraction.diagnosis ?? null,
      diagnosisExplanation: extraction.diagnosisExplanation ?? null,
      medications: extraction.medications.map((m) => ({
        name: m.name,
        dose: m.dose,
        purpose: m.purpose,
        instruction: m.instruction,
      })),
      followUpRecommendations: extraction.followUpRecommendations,
    };
  }

  private async applyDiagnosisIfUnset(userId: string, diagnosis: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || user.diagnosis) return;
    user.diagnosis = diagnosis;
    user.stage = user.stage ?? 'Stage 1';
    await this.userRepository.save(user);
    await this.healthEventRepository.save(
      this.healthEventRepository.create({
        id: generateEventId(),
        user_id: userId,
        kind: 'diagnosis',
        title: 'Diagnosis confirmed',
        detail: `${diagnosis} — treatment plan started`,
      }),
    );
  }

  private toSummary(doc: MedicalDocument) {
    return {
      id: doc.id,
      name: doc.name,
      type: doc.type,
      date: fullDateLabel(doc.created_at),
      status: doc.status,
      pages: doc.pages,
    };
  }
}
