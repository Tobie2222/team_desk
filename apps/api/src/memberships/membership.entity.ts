import { MembershipRole } from 'src/common/enums/membership-role.enums';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('memberships')
@Unique(['userId', 'organizationId'])
export class Membership {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'user_id' })
  userId!: string;

  @Index()
  @Column({ name: 'organization_id' })
  organizationId!: string;

  @Column({ type: 'enum', enum: MembershipRole })
  role!: MembershipRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
