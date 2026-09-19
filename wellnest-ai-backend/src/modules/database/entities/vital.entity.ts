import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

export type VitalStatus = 'improving' | 'steady' | 'declining';

@Entity('vitals')
export class Vital {
  @PrimaryColumn({ type: 'varchar', length: 120 })
  id!: string;

  @Column({ type: 'varchar', length: 120, name: 'user_id' })
  user_id!: string;

  @Column({ type: 'varchar', length: 80 })
  label!: string;

  @Column({ type: 'varchar', length: 40 })
  value!: string;

  @Column({ type: 'varchar', length: 20 })
  unit!: string;

  @Column({ type: 'varchar', length: 20 })
  status!: VitalStatus;

  @Column({ type: 'varchar', length: 160, nullable: true })
  note?: string;

  @CreateDateColumn({ name: 'recorded_at' })
  recorded_at!: Date;
}
