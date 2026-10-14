import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('ticket_comments')
@Index(['organizationId', 'ticketId', 'createdAt'])
export class TicketComment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'ticket_id', type: 'varchar', length: 36 })
  ticketId!: string;

  @Column({ name: 'organization_id', type: 'varchar', length: 36 })
  organizationId!: string;

  @Column({ name: 'author_id', type: 'varchar', length: 36 })
  authorId!: string;

  @Column({ type: 'text' })
  body!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
