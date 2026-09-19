import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

export type DocumentType = 'Prescription' | 'Lab result' | 'Discharge summary' | 'Document';
export type DocumentStatus = 'Processing' | 'Analyzed' | 'Failed';

@Entity('medical_documents')
export class MedicalDocument {
  @PrimaryColumn({ type: 'varchar', length: 120 })
  id!: string;

  @Column({ type: 'varchar', length: 120, name: 'user_id' })
  user_id!: string;

  @Column({ type: 'varchar', length: 160 })
  name!: string;

  @Column({ type: 'varchar', length: 30 })
  type!: DocumentType;

  @Column({ type: 'varchar', length: 20, default: 'Processing' })
  status!: DocumentStatus;

  @Column({ type: 'int', default: 1 })
  pages!: number;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'original_filename' })
  original_filename?: string;

  @Column({ type: 'varchar', length: 120, nullable: true, name: 'extracted_diagnosis' })
  extracted_diagnosis?: string | undefined;

  @Column({ type: 'text', nullable: true, name: 'extracted_summary' })
  extracted_summary?: string;

  @Column({ type: 'text', nullable: true, name: 'follow_up_recommendations' })
  follow_up_recommendations?: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;
}
