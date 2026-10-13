import { MembershipRole } from 'src/common/enums/membership-role.enums';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('invitations')
export class Invitation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'organization_id', type: 'varchar', length: 36 })
  organizationId!: string;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'enum', enum: MembershipRole })
  role!: MembershipRole;

  @Index({ unique: true })
  @Column({ name: 'token_hash', type: 'varchar', length: 64 })
  tokenHash!: string;

  @Column({ name: 'expires_at', type: 'datetime' })
  expiresAt!: Date;

  @Column({ name: 'accepted_at', type: 'datetime', nullable: true })
  acceptedAt: Date | null = null;

  @Column({ name: 'invited_by', type: 'varchar', length: 36 })
  invitedBy!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
