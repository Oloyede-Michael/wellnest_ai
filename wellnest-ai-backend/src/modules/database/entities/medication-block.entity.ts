import { Column, Entity, PrimaryColumn } from 'typeorm';

export type TimeOfDay = 'Morning' | 'Afternoon' | 'Night';

@Entity('medication_blocks')
export class MedicationBlock {
  @PrimaryColumn({ type: 'varchar', length: 120 })
  id!: string;

  @Column({ type: 'varchar', length: 120, name: 'user_id' })
  user_id!: string;

  @Column({ type: 'varchar', length: 120, nullable: true, name: 'document_id' })
  document_id?: string;

  @Column({ type: 'varchar', length: 20, name: 'time_of_day' })
  time_of_day!: TimeOfDay;

  @Column({ type: 'varchar', length: 20 })
  clock!: string;

  @Column({ type: 'boolean', default: true })
  active!: boolean;
}
