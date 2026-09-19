import { Injectable } from '@nestjs/common';
import { KNOWN_MEDICATIONS, KnownMedication, translateDiagnosis } from './knowledge-base';

export interface NlpExtraction {
  diagnosis?: string | undefined;
  diagnosisExplanation?: string | undefined;
  medications: KnownMedication[];
  followUpRecommendations: string;
  summary: string;
}

/**
 * Stands in for a real medical NLP engine (see PRD section 14 / "AI Diagnosis
 * Translator"). Scans mock OCR text for known terms and medication names and
 * returns structured extraction + a plain-language diagnosis explanation.
 */
@Injectable()
export class MedicalNlpMockService {
  extract(ocrText: string): NlpExtraction {
    const lower = ocrText.toLowerCase();

    const medications = Object.entries(KNOWN_MEDICATIONS)
      .filter(([keyword]) => lower.includes(keyword))
      .map(([, med]) => med);

    const diagnosisMatch = /hypertension|type 2 diabetes|asthma|hyperlipidemia/.exec(lower);
    const diagnosis = diagnosisMatch ? this.titleCase(diagnosisMatch[0]) : undefined;
    const diagnosisExplanation = diagnosis ? translateDiagnosis(diagnosis) : undefined;

    const followUpRecommendations = /follow.?up/.test(lower)
      ? 'Schedule a follow-up visit with your care provider within the next 2-4 weeks.'
      : 'No urgent follow-up flagged — continue your current treatment plan.';

    const summaryParts = [
      diagnosis ? `Diagnosis identified: ${diagnosis}.` : 'No specific diagnosis term recognized in this document.',
      medications.length
        ? `${medications.length} medication${medications.length > 1 ? 's' : ''} extracted (${medications
            .map((m) => m.name)
            .join(', ')}).`
        : 'No medications recognized in this document.',
    ];

    return {
      diagnosis,
      diagnosisExplanation,
      medications,
      followUpRecommendations,
      summary: summaryParts.join(' '),
    };
  }

  private titleCase(text: string): string {
    return text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
  }
}
