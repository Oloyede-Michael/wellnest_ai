import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('user_preferences')
export class UserPreference {
  @PrimaryColumn({ type: 'varchar', length: 120, name: 'user_id' })
  user_id!: string;

  @Column({ type: 'boolean', default: true, name: 'medication_reminders' })
  medication_reminders!: boolean;

  @Column({ type: 'boolean', default: true, name: 'caregiver_notifications' })
  caregiver_notifications!: boolean;

  @Column({ type: 'boolean', default: false, name: 'biometric_lock' })
  biometric_lock!: boolean;
}
