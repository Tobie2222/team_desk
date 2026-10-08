import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MembershipRole } from 'src/common/enums/membership-role.enums';
import { ROLES_KEY } from 'src/common/decorator/roles.decorator';
import { TenantContextService } from 'src/common/tenant/tenant-context.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tenantContext: TenantContextService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<MembershipRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { role } = this.tenantContext.get();
    if (!requiredRoles.includes(role)) {
      throw new ForbiddenException('Insufficient role for this action');
    }

    return true;
  }
}
