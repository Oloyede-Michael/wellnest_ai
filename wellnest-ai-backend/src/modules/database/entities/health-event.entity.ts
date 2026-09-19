import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

export type HealthEventKind = 'document' | 'medication' | 'appointment' | 'diagnosis' | 'insight';

/** Backs both the full Health Journey Timeline and the Dashboard's "recent activity" feed. */
@Entity('health_events')
export class HealthEvent {
  @PrimaryColumn({ type: 'varchar', length: 120 })
  id!: string;

  @Column({ type: 'varchar', length: 120, name: 'user_id' })
  user_id!: string;

  @Column({ type: 'varchar', length: 20 })
  kind!: HealthEventKind;

  @Column({ type: 'varchar', length: 160 })
  title!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  detail?: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;
}
