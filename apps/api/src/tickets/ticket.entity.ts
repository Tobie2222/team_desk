import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TicketPriority } from '../common/enums/ticket-priority.enums';
import { TicketStatus } from '../common/enums/ticket-status.enums';

@Entity('tickets')
@Index(['organizationId', 'status', 'createdAt'])
@Index(['organizationId', 'requesterId'])
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'organization_id', type: 'varchar', length: 36 })
  organizationId!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.OPEN })
  status!: TicketStatus;

  @Column({
    type: 'enum',
    enum: TicketPriority,
    default: TicketPriority.MEDIUM,
  })
  priority!: TicketPriority;

  @Column({ name: 'requester_id', type: 'varchar', length: 36 })
  requesterId!: string;

  @Column({ name: 'assignee_id', type: 'varchar', length: 36, nullable: true })
  assigneeId: string | null = null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt: Date | null = null;
}
