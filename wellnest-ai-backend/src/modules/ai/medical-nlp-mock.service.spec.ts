import { MedicalNlpMockService } from './medical-nlp-mock.service';

describe('MedicalNlpMockService.extract', () => {
  const service = new MedicalNlpMockService();

  it('extracts known medications mentioned in the text', () => {
    const result = service.extract(
      'Prescription. Lisinopril 10mg — take with water, before breakfast. Aspirin 81mg — take with food.',
    );

    expect(result.medications.map((m) => m.name)).toEqual(['Lisinopril', 'Aspirin']);
  });

  it('recognizes a known diagnosis term and attaches a plain-language explanation', () => {
    const result = service.extract('Findings consistent with hypertension, stage 1.');

    expect(result.diagnosis).toBe('Hypertension');
    expect(result.diagnosisExplanation).toMatch(/blood pressure/i);
  });

  it('leaves diagnosis and explanation undefined when no known term is present', () => {
    const result = service.extract('Routine wellness note, no specific findings.');

    expect(result.diagnosis).toBeUndefined();
    expect(result.diagnosisExplanation).toBeUndefined();
    expect(result.medications).toEqual([]);
  });
});
