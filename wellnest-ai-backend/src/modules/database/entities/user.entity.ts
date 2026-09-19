import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

export type UserRole = 'patient' | 'caregiver';

@Entity('users')
export class User {
  @PrimaryColumn({ type: 'varchar', length: 120 })
  id!: string;

  @Column({ type: 'varchar', length: 190, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 100, name: 'password_hash' })
  password_hash!: string;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ type: 'varchar', length: 20 })
  role!: UserRole;

  @Column({ type: 'varchar', length: 40, default: 'Free' })
  plan!: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  diagnosis?: string;

  @Column({ type: 'varchar', length: 40, nullable: true })
  stage?: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'next_appointment_date' })
  next_appointment_date?: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'next_appointment_time' })
  next_appointment_time?: string;

  @Column({ type: 'varchar', length: 160, nullable: true, name: 'next_appointment_with' })
  next_appointment_with?: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
}
