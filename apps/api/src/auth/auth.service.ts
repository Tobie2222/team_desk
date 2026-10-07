import { ConflictException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SignupDto } from './dto/signup.dto';
import { User } from 'src/users/user.entity';
import { Organization } from 'src/organizations/ organizations.entity';
import { Membership } from 'src/memberships/membership.entity';
import { MembershipRole } from 'src/common/enums/membership-role.enums';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private readonly dataSource: DataSource) {}

  async signup(dto: SignupDto) {
    return this.dataSource.transaction(async (manager) => {
      const existing = await manager.findOne(User, {
        where: { email: dto.email },
      });
      if (existing) {
        throw new ConflictException('Email already in use');
      }

      const passwordHash = await bcrypt.hash(dto.password, 10);

      const user = manager.create(User, {
        email: dto.email,
        passwordHash,
        name: dto.name,
      });
      await manager.save(user);

      const organization = manager.create(Organization, {
        name: dto.organizationName,
        plan: 'free',
      });
      await manager.save(organization);

      const membership = manager.create(Membership, {
        userId: user.id,
        organizationId: organization.id,
        role: MembershipRole.OWNER,
      });
      await manager.save(membership);

      const safeUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      };
      return { user: safeUser, organization, membership };
    });
  }
}
