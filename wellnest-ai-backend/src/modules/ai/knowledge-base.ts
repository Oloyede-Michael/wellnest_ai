export type KnownTimeOfDay = 'Morning' | 'Afternoon' | 'Night';

export interface KnownMedication {
  name: string;
  dose: string;
  purpose: string;
  instruction: string;
  timeOfDay: KnownTimeOfDay;
}

/**
 * Deterministic stand-in for a real medical NLP model. Hackathon MVP — see
 * PRD section 19 ("What's not built yet"): the real OCR/NLP engines are a
 * follow-up; this keeps the end-to-end flow demoable without external APIs.
 */
export const KNOWN_MEDICATIONS: Record<string, KnownMedication> = {
  lisinopril: {
    name: 'Lisinopril',
    dose: '10mg',
    purpose: 'For blood pressure',
    instruction: 'Take with water, before breakfast',
    timeOfDay: 'Morning',
  },
  aspirin: {
    name: 'Aspirin',
    dose: '81mg',
    purpose: 'Blood thinner',
    instruction: 'Take with food',
    timeOfDay: 'Morning',
  },
  amlodipine: {
    name: 'Amlodipine',
    dose: '5mg',
    purpose: 'For blood pressure',
    instruction: 'Take after lunch',
    timeOfDay: 'Afternoon',
  },
  atorvastatin: {
    name: 'Atorvastatin',
    dose: '20mg',
    purpose: 'Cholesterol control',
    instruction: 'Take before bed',
    timeOfDay: 'Night',
  },
  metformin: {
    name: 'Metformin',
    dose: '500mg',
    purpose: 'Blood sugar support',
    instruction: 'Take with dinner',
    timeOfDay: 'Night',
  },
};

export const DIAGNOSIS_TRANSLATIONS: Record<string, string> = {
  hypertension:
    'Your blood pressure is higher than normal and requires regular monitoring and medication.',
  'type 2 diabetes':
    'Your body has trouble keeping blood sugar steady, so diet, activity, and medication all work together to keep levels in range.',
  asthma:
    'Your airways are more sensitive and can narrow suddenly, making it harder to breathe — a rescue inhaler helps open them back up quickly.',
  hyperlipidemia:
    'You have higher-than-normal cholesterol, which can build up in your blood vessels over time if it stays untreated.',
  'seasonal asthma':
    'Certain seasons trigger extra airway sensitivity for you — keeping a rescue inhaler nearby during those months helps.',
};

export function translateDiagnosis(term: string): string {
  const key = term.trim().toLowerCase();
  return (
    DIAGNOSIS_TRANSLATIONS[key] ??
    `${term} means your care team has identified a condition that needs ongoing monitoring and treatment — ask them for specifics on what it means for your daily routine.`
  );
}
