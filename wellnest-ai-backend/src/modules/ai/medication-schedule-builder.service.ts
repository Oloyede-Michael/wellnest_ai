import { Injectable } from '@nestjs/common';
import { KnownMedication, KnownTimeOfDay } from './knowledge-base';

export interface BuiltMedicationBlock {
  timeOfDay: KnownTimeOfDay;
  clock: string;
  items: Array<Pick<KnownMedication, 'name' | 'dose' | 'purpose' | 'instruction'>>;
}

const DEFAULT_CLOCK: Record<KnownTimeOfDay, string> = {
  Morning: '8:00 AM',
  Afternoon: '1:00 PM',
  Night: '9:00 PM',
};

/** PRD feature "Medication Planner" (P0-3) — groups extracted medications into a time-of-day schedule. */
@Injectable()
export class MedicationScheduleBuilderService {
  buildBlocks(medications: KnownMedication[]): BuiltMedicationBlock[] {
    const byTime = new Map<KnownTimeOfDay, BuiltMedicationBlock>();

    for (const med of medications) {
      const existing = byTime.get(med.timeOfDay);
      const item = { name: med.name, dose: med.dose, purpose: med.purpose, instruction: med.instruction };
      if (existing) {
        existing.items.push(item);
      } else {
        byTime.set(med.timeOfDay, {
          timeOfDay: med.timeOfDay,
          clock: DEFAULT_CLOCK[med.timeOfDay],
          items: [item],
        });
      }
    }

    const order: KnownTimeOfDay[] = ['Morning', 'Afternoon', 'Night'];
    return order.filter((t) => byTime.has(t)).map((t) => byTime.get(t)!);
  }
}
