import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('medication_items')
export class MedicationItem {
  @PrimaryColumn({ type: 'varchar', length: 120 })
  id!: string;

  @Column({ type: 'varchar', length: 120, name: 'block_id' })
  block_id!: string;

  @Column({ type: 'varchar', length: 120, name: 'user_id' })
  user_id!: string;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ type: 'varchar', length: 40 })
  dose!: string;

  @Column({ type: 'varchar', length: 160, nullable: true })
  purpose?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  instruction?: string;
}
