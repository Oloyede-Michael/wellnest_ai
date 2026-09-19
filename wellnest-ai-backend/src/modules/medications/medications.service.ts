import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { MedicationBlock, TimeOfDay } from '../database/entities/medication-block.entity';
import { MedicationItem } from '../database/entities/medication-item.entity';
import { MedicationDoseLog } from '../database/entities/medication-dose-log.entity';
import { HealthEvent } from '../database/entities/health-event.entity';
import { BuiltMedicationBlock } from '../ai/medication-schedule-builder.service';
import { generateEventId, generateMedicationBlockId, generateMedicationItemId } from '../../utils/id.util';
import { lastNDates, shortWeekdayLabel, todayDateOnly } from '../../utils/date.util';

const TIME_OF_DAY_ORDER: TimeOfDay[] = ['Morning', 'Afternoon', 'Night'];

@Injectable()
export class MedicationsService {
  constructor(
    @InjectRepository(MedicationBlock) private readonly blockRepository: Repository<MedicationBlock>,
    @InjectRepository(MedicationItem) private readonly itemRepository: Repository<MedicationItem>,
    @InjectRepository(MedicationDoseLog) private readonly doseLogRepository: Repository<MedicationDoseLog>,
    @InjectRepository(HealthEvent) private readonly healthEventRepository: Repository<HealthEvent>,
  ) {}

  async getSchedule(userId: string) {
    const blocks = await this.blockRepository.find({ where: { user_id: userId } });
    blocks.sort((a, b) => TIME_OF_DAY_ORDER.indexOf(a.time_of_day) - TIME_OF_DAY_ORDER.indexOf(b.time_of_day));

    const items = await this.itemRepository.find({ where: { user_id: userId } });
    const itemsByBlock = new Map<string, MedicationItem[]>();
    for (const item of items) {
      const list = itemsByBlock.get(item.block_id) ?? [];
      list.push(item);
      itemsByBlock.set(item.block_id, list);
    }

    const today = todayDateOnly();
    const todaysLogs = await this.doseLogRepository.find({ where: { user_id: userId, for_date: today } });
    const takenByItemId = new Map(todaysLogs.map((log) => [log.item_id, log.taken]));

    return blocks.map((block) => ({
      id: block.id,
      time: block.time_of_day,
      clock: block.clock,
      active: block.active,
      items: (itemsByBlock.get(block.id) ?? []).map((item) => ({
        id: item.id,
        name: item.name,
        dose: item.dose,
        purpose: item.purpose,
        instruction: item.instruction,
        taken: takenByItemId.get(item.id) ?? false,
      })),
    }));
  }

  async toggleBlockActive(userId: string, blockId: string) {
    const block = await this.blockRepository.findOne({ where: { id: blockId, user_id: userId } });
    if (!block) throw new NotFoundException('Medication block not found');
    block.active = !block.active;
    await this.blockRepository.save(block);
    return { id: block.id, active: block.active };
  }

  async toggleItemTaken(userId: string, itemId: string, date?: string) {
    const item = await this.itemRepository.findOne({ where: { id: itemId, user_id: userId } });
    if (!item) throw new NotFoundException('Medication item not found');

    const forDate = date ?? todayDateOnly();
    let log = await this.doseLogRepository.findOne({ where: { item_id: itemId, for_date: forDate } });
    if (!log) {
      log = this.doseLogRepository.create({
        id: `${itemId}_${forDate}`,
        item_id: itemId,
        user_id: userId,
        for_date: forDate,
        taken: false,
      });
    }
    log.taken = !log.taken;
    log.taken_at = log.taken ? new Date() : undefined;
    await this.doseLogRepository.save(log);

    if (log.taken) {
      await this.healthEventRepository.save(
        this.healthEventRepository.create({
          id: generateEventId(),
          user_id: userId,
          kind: 'medication',
          title: `${item.name} taken`,
          detail: `${item.dose} · ${item.purpose ?? ''}`.trim(),
        }),
      );
    }

    return { id: item.id, date: forDate, taken: log.taken };
  }

  async getWeekAdherence(userId: string) {
    return this.computeWeekAdherence(userId, new Date());
  }

  /** Overall adherence % (current week) plus trend vs. the prior week, for the dashboard hero. */
  async getAdherenceSummary(userId: string): Promise<{ adherence: number; trend: number }> {
    const now = new Date();
    const currentWeek = await this.computeWeekAdherence(userId, now);
    const previousWeekEnd = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const previousWeek = await this.computeWeekAdherence(userId, previousWeekEnd);

    const avg = (values: number[]) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0);
    const currentAvg = avg(currentWeek.map((d) => d.value));
    const previousAvg = avg(previousWeek.map((d) => d.value));

    return { adherence: Math.round(currentAvg), trend: Math.round(currentAvg - previousAvg) };
  }

  private async computeWeekAdherence(userId: string, endingOn: Date) {
    const totalItems = await this.itemRepository.count({ where: { user_id: userId } });
    const dates = lastNDates(7, endingOn);
    if (totalItems === 0) {
      return dates.map((date) => ({ day: shortWeekdayLabel(date), value: 0 }));
    }

    const logs = await this.doseLogRepository.find({
      where: { user_id: userId, for_date: In(dates), taken: true },
    });
    const takenCountByDate = new Map<string, number>();
    for (const log of logs) {
      takenCountByDate.set(log.for_date, (takenCountByDate.get(log.for_date) ?? 0) + 1);
    }

    return dates.map((date) => ({
      day: shortWeekdayLabel(date),
      value: Math.round(((takenCountByDate.get(date) ?? 0) / totalItems) * 100),
    }));
  }

  /** Called by the documents pipeline to fold newly-extracted medications into the existing schedule. */
  async mergeExtractedBlocks(userId: string, documentId: string, builtBlocks: BuiltMedicationBlock[]) {
    for (const built of builtBlocks) {
      let block = await this.blockRepository.findOne({ where: { user_id: userId, time_of_day: built.timeOfDay } });
      if (!block) {
        block = this.blockRepository.create({
          id: generateMedicationBlockId(),
          user_id: userId,
          document_id: documentId,
          time_of_day: built.timeOfDay,
          clock: built.clock,
          active: true,
        });
        await this.blockRepository.save(block);
      }

      const existingNames = new Set(
        (await this.itemRepository.find({ where: { block_id: block.id } })).map((i) => i.name),
      );

      for (const item of built.items) {
        if (existingNames.has(item.name)) continue;
        await this.itemRepository.save(
          this.itemRepository.create({
            id: generateMedicationItemId(),
            block_id: block.id,
            user_id: userId,
            name: item.name,
            dose: item.dose,
            purpose: item.purpose,
            instruction: item.instruction,
          }),
        );
      }
    }
  }
}
