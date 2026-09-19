import { Injectable } from '@nestjs/common';

export interface OcrResult {
  text: string;
  /** Best-guess document type inferred from the filename, for the mock pipeline to key off. */
  typeHint: 'Prescription' | 'Lab result' | 'Discharge summary' | 'Document';
}

/**
 * Stands in for a real OCR engine (see PRD section 14). Since there is no
 * actual image/PDF text extraction wired up yet, this derives a plausible
 * "scanned text" result from the filename so the rest of the pipeline
 * (diagnosis translation, medication extraction) has something to work with.
 */
@Injectable()
export class OcrMockService {
  extractText(originalFilename: string): OcrResult {
    const name = originalFilename.toLowerCase();

    if (/(lab|blood|panel|metabolic|cholesterol)/.test(name)) {
      return {
        typeHint: 'Lab result',
        text:
          'Comprehensive metabolic panel. Blood pressure 128/82 mmHg. Fasting glucose within range. ' +
          'Cholesterol panel reviewed. Findings consistent with hypertension, stage 1. Continue current medications.',
      };
    }

    if (/(discharge|summary|cardiology|hospital)/.test(name)) {
      return {
        typeHint: 'Discharge summary',
        text:
          'Discharge summary — Cardiology. Diagnosis: hypertension, stage 1. Patient stable, follow-up recommended ' +
          'with cardiology in 4 weeks. Continue Lisinopril 10mg and Aspirin 81mg as prescribed.',
      };
    }

    if (/(prescription|rx|script)/.test(name) || /(lisinopril|amlodipine|atorvastatin|metformin|aspirin)/.test(name)) {
      return {
        typeHint: 'Prescription',
        text:
          'Prescription. Lisinopril 10mg — take with water, before breakfast. Aspirin 81mg — take with food. ' +
          'Amlodipine 5mg — take after lunch. Diagnosis: hypertension, stage 1.',
      };
    }

    return {
      typeHint: 'Document',
      text:
        'Medical document reviewed. Diagnosis: hypertension, stage 1. Lisinopril 10mg — take with water, before ' +
        'breakfast. Follow up with your primary care provider in 4 weeks.',
    };
  }
}
