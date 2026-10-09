import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MembershipRole } from 'src/common/enums/membership-role.enums';
import { Membership } from './membership.entity';
import { Repository } from 'typeorm';
import { TenantContextService } from 'src/common/tenant/tenant-context.service';
import { User } from 'src/users/user.entity';

export interface MemberListItem {
  memberShipId: string;
  userId: string;
  name: string;
  email: string;
  role: MembershipRole;
}

@Injectable()
export class MemberShipService {
  constructor(
    @InjectRepository(Membership)
    private readonly repo: Repository<Membership>,
    private readonly tenant: TenantContextService,
  ) {}

  listMember(): Promise<MemberListItem[]> {
    const { organizationId } = this.tenant.get();
    return this.repo
      .createQueryBuilder('m')
      .innerJoin(User, 'u', 'u.id = m.userId')
      .select('m.id', 'membershipId')
      .addSelect('u.id', 'userId')
      .addSelect('u.name', 'name')
      .addSelect('u.email', 'email')
      .addSelect('m.role', 'role')
      .where('m.organizationId = :organizationId', { organizationId })
      .orderBy('m.createdAt', 'ASC')
      .getRawMany<MemberListItem>();
  }
}
