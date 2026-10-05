import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ length: 120 })
  name?: string;

  @Column({ length: 20, default: 'free' })
  plan?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt?: Date;
}
