import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

export type ChatRole = 'user' | 'assistant';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryColumn({ type: 'varchar', length: 120 })
  id!: string;

  @Column({ type: 'varchar', length: 120, name: 'user_id' })
  user_id!: string;

  @Column({ type: 'varchar', length: 20 })
  role!: ChatRole;

  @Column({ type: 'text' })
  text!: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;
}
