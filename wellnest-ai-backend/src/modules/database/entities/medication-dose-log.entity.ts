import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

/** One row per (medication item, calendar day) — tracks whether that day's dose was marked taken. */
@Entity('medication_dose_logs')
@Index(['item_id', 'for_date'], { unique: true })
export class MedicationDoseLog {
  @PrimaryColumn({ type: 'varchar', length: 120 })
  id!: string;

  @Column({ type: 'varchar', length: 120, name: 'item_id' })
  item_id!: string;

  @Column({ type: 'varchar', length: 120, name: 'user_id' })
  user_id!: string;

  @Column({ type: 'text', name: 'for_date' })
  for_date!: string;

  @Column({ type: 'boolean', default: false })
  taken!: boolean;

  @Column({ type: 'text', nullable: true, name: 'taken_at' })
  taken_at?: Date | undefined;
}
