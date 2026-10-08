import { ClsStore } from 'nestjs-cls';
import { MembershipRole } from '../enums/membership-role.enums';

export interface TenantContext {
  userId: string;
  organizationId: string;
  role: MembershipRole;
}

export interface AppClsStore extends ClsStore {
  tenant: TenantContext;
}
