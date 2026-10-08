import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/common/decorator/public.decorator';
import { SKIP_TENANT_KEY } from 'src/common/decorator/skip-tenant.decorator';
import { TenantContextService } from 'src/common/tenant/tenant-context.service';
import { AuthenticatedRequest } from 'src/common/types/authenticated-request';
import { Membership } from 'src/memberships/membership.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly dataSource: DataSource,
    private readonly tenantContext: TenantContextService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      targets,
    );
    const skipTenant = this.reflector.getAllAndOverride<boolean>(
      SKIP_TENANT_KEY,
      targets,
    );
    if (isPublic || skipTenant) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.user?.userId;
    const organizationId = request.headers['x-organization-id'];

    if (!userId) {
      throw new UnauthorizedException();
    }
    if (typeof organizationId !== 'string' || organizationId.length === 0) {
      throw new BadRequestException('Missing X-Organization-Id header');
    }

    const membership = await this.dataSource.manager.findOne(Membership, {
      where: { userId, organizationId },
    });
    if (!membership) {
      throw new ForbiddenException('You are not a member of this organization');
    }

    this.tenantContext.set({ userId, organizationId, role: membership.role });
    return true;
  }
}
