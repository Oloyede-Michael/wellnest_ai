import { MedicationsService } from './medications.service';

function buildService() {
  const blockRepository = { find: jest.fn(), findOne: jest.fn(), save: jest.fn(), create: jest.fn((d) => d) };
  const itemRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    save: jest.fn(),
    create: jest.fn((d) => d),
  };
  const doseLogRepository = {
    findOne: jest.fn(),
    save: jest.fn((log) => log),
    create: jest.fn((d) => d),
    find: jest.fn(),
  };
  const healthEventRepository = { save: jest.fn(), create: jest.fn((d) => d) };

  const service = new MedicationsService(
    blockRepository as never,
    itemRepository as never,
    doseLogRepository as never,
    healthEventRepository as never,
  );
  return { service, blockRepository, itemRepository, doseLogRepository, healthEventRepository };
}

describe('MedicationsService.toggleItemTaken', () => {
  it('creates a new dose log marked taken when none exists yet, and logs an activity event', async () => {
    const { service, itemRepository, doseLogRepository, healthEventRepository } = buildService();
    itemRepository.findOne.mockResolvedValue({ id: 'item-1', name: 'Lisinopril', dose: '10mg', purpose: 'BP' });
    doseLogRepository.findOne.mockResolvedValue(null);

    const result = await service.toggleItemTaken('user-1', 'item-1', '2026-01-01');

    expect(result).toEqual({ id: 'item-1', date: '2026-01-01', taken: true });
    expect(doseLogRepository.save).toHaveBeenCalledWith(expect.objectContaining({ taken: true }));
    expect(healthEventRepository.save).toHaveBeenCalled();
  });

  it('flips an existing taken log back to not-taken and skips the activity event', async () => {
    const { service, itemRepository, doseLogRepository, healthEventRepository } = buildService();
    itemRepository.findOne.mockResolvedValue({ id: 'item-1', name: 'Lisinopril', dose: '10mg', purpose: 'BP' });
    doseLogRepository.findOne.mockResolvedValue({
      id: 'item-1_2026-01-01',
      item_id: 'item-1',
      for_date: '2026-01-01',
      taken: true,
    });

    const result = await service.toggleItemTaken('user-1', 'item-1', '2026-01-01');

    expect(result.taken).toBe(false);
    expect(healthEventRepository.save).not.toHaveBeenCalled();
  });
});

describe('MedicationsService.getWeekAdherence', () => {
  it('returns all-zero days when the patient has no medication items yet', async () => {
    const { service, itemRepository } = buildService();
    itemRepository.count.mockResolvedValue(0);

    const result = await service.getWeekAdherence('user-1');

    expect(result).toHaveLength(7);
    expect(result.every((d) => d.value === 0)).toBe(true);
  });
});
