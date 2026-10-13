import { DataSource, IsNull } from 'typeorm';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { TenantContextService } from 'src/common/tenant/tenant-context.service';
import { MembershipRole } from 'src/common/enums/membership-role.enums';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Membership } from 'src/memberships/membership.entity';
import { User } from 'src/users/user.entity';
import * as crypto from 'crypto';
import { Invitation } from './invitation.entity';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
const INVITATION_EXPIRES_IN_DAYS = 7;

@Injectable()
export class InvitationsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly tenantContext: TenantContextService,
  ) {}

  async create(dto: CreateInvitationDto) {
    const {
      organizationId,
      userId,
      role: callerRole,
    } = this.tenantContext.get();
    if (
      dto.role === MembershipRole.ADMIN &&
      callerRole !== MembershipRole.OWNER
    ) {
      throw new ForbiddenException('Only the owner can invite an admin');
    }

    const email = dto.email.trim().toLocaleLowerCase();

    const existingMember = await this.dataSource
      .createQueryBuilder()
      .select('m.id', 'id')
      .from(Membership, 'm')
      .innerJoin(User, 'u', 'u.id = m.userId')
      .where('m.organizationId = :organizationId', { organizationId })
      .andWhere('LOWER(u.email) = :email', { email })
      .getRawOne<{ id: string }>();
    if (existingMember) {
      throw new ConflictException('This user is already a member');
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');
    const expiresAt = new Date(
      Date.now() + INVITATION_EXPIRES_IN_DAYS * ONE_DAY_IN_MS,
    );
    const invitation = await this.dataSource.transaction(async (manager) => {
      await manager.update(
        Invitation,
        { organizationId, email, acceptedAt: IsNull() },
        { expiresAt: new Date() },
      );
      const row = manager.create(Invitation, {
        organizationId,
        email,
        role: dto.role,
        tokenHash,
        expiresAt,
        invitedBy: userId,
      });
      return manager.save(row);
    });
    return {
      id: invitation.id,
      email,
      role: invitation.role,
      expiresAt,
      token: rawToken,
    };
  }

  async accept(userId: string, dto: AcceptInvitationDto) {
    const tokenHash = crypto
      .createHash('sha256')
      .update(dto.token)
      .digest('hex');

    return this.dataSource.transaction(async (manager) => {
      const invitation = await manager.findOne(Invitation, {
        where: { tokenHash },
        lock: { mode: 'pessimistic_write' },
      });
      if (
        !invitation ||
        invitation.acceptedAt ||
        invitation.expiresAt < new Date()
      ) {
        throw new BadRequestException('Invadlid or expired invitation');
      }

      const user = await manager.findOne(User, {
        where: { id: userId },
      });
      if (
        !userId ||
        user?.email.trim().toLocaleLowerCase() !== invitation.email
      ) {
        throw new ForbiddenException(
          'This invitation was sent to a diffrent email address',
        );
      }

      const existing = await manager.findOne(Membership, {
        where: { userId, organizationId: invitation.organizationId },
      });
      if (existing) {
        throw new ConflictException('You are already a member');
      }

      const membership = manager.create(Membership, {
        userId,
        organizationId: invitation.organizationId,
        role: invitation.role,
      });
      await manager.save(membership);
      invitation.acceptedAt = new Date();
      await manager.save(invitation);
      return {
        organizationId: membership.organizationId,
        role: membership.role,
      };
    });
  }
}
