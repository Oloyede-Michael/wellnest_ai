import { MedicationScheduleBuilderService } from './medication-schedule-builder.service';
import { KNOWN_MEDICATIONS } from './knowledge-base';

describe('MedicationScheduleBuilderService.buildBlocks', () => {
  const service = new MedicationScheduleBuilderService();

  it('groups medications by time of day in Morning/Afternoon/Night order', () => {
    const blocks = service.buildBlocks([
      KNOWN_MEDICATIONS['atorvastatin']!,
      KNOWN_MEDICATIONS['lisinopril']!,
      KNOWN_MEDICATIONS['amlodipine']!,
      KNOWN_MEDICATIONS['aspirin']!,
    ]);

    expect(blocks.map((b) => b.timeOfDay)).toEqual(['Morning', 'Afternoon', 'Night']);
    expect(blocks[0]!.items.map((i) => i.name)).toEqual(['Lisinopril', 'Aspirin']);
    expect(blocks[1]!.items.map((i) => i.name)).toEqual(['Amlodipine']);
    expect(blocks[2]!.items.map((i) => i.name)).toEqual(['Atorvastatin']);
  });

  it('returns no blocks for an empty medication list', () => {
    expect(service.buildBlocks([])).toEqual([]);
  });
});
