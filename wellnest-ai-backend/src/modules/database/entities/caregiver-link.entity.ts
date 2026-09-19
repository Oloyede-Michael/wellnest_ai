import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

export type CaregiverAccessLevel = 'full' | 'appointments' | 'medications';
export type CaregiverLinkStatus = 'pending' | 'active';

@Entity('caregiver_links')
export class CaregiverLink {
  @PrimaryColumn({ type: 'varchar', length: 120 })
  id!: string;

  @Column({ type: 'varchar', length: 120, name: 'patient_id' })
  patient_id!: string;

  @Column({ type: 'varchar', length: 120, nullable: true, name: 'caregiver_user_id' })
  caregiver_user_id?: string;

  @Column({ type: 'varchar', length: 190 })
  email!: string;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ type: 'varchar', length: 80 })
  relation!: string;

  @Column({ type: 'varchar', length: 20, default: 'full', name: 'access_level' })
  access_level!: CaregiverAccessLevel;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status!: CaregiverLinkStatus;

  @Column({ type: 'varchar', length: 160, nullable: true, name: 'last_activity_note' })
  last_activity_note?: string;

  @CreateDateColumn({ name: 'invited_at' })
  invited_at!: Date;
}
