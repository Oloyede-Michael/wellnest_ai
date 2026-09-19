import { Injectable } from '@nestjs/common';
import { translateDiagnosis } from './knowledge-base';

/** PRD feature "AI Diagnosis Translator" (P0-2) as its own standalone, callable service. */
@Injectable()
export class DiagnosisTranslatorService {
  translate(term: string): { term: string; explanation: string } {
    return { term, explanation: translateDiagnosis(term) };
  }
}
