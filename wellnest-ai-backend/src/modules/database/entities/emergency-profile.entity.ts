import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('emergency_profiles')
export class EmergencyProfile {
  @PrimaryColumn({ type: 'varchar', length: 120, name: 'user_id' })
  user_id!: string;

  @Column({ type: 'varchar', length: 10, nullable: true, name: 'blood_group' })
  blood_group?: string;

  @Column({ type: 'json' })
  allergies!: string[];

  @Column({ type: 'json' })
  conditions!: string[];

  @Column({ type: 'json', name: 'medications_summary' })
  medications_summary!: string[];
}
