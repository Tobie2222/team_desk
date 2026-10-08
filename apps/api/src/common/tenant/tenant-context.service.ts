import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { AppClsStore, TenantContext } from './tenant-context';

@Injectable()
export class TenantContextService {
  constructor(private readonly cls: ClsService<AppClsStore>) {}

  set(tenant: TenantContext) {
    this.cls.set('tenant', tenant);
  }

  get(): TenantContext {
    const tenant = this.cls.get('tenant');
    if (!tenant) {
      throw new Error(
        'Tenant context is not set. Is TenantGuard applied to this route',
      );
    }
    return tenant;
  }
}
