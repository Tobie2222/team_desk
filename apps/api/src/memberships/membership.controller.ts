import { Controller, Get } from '@nestjs/common';
import { MemberShipService } from './membership.service';
import { MembershipRole } from 'src/common/enums/membership-role.enums';
import { Roles } from 'src/common/decorator/roles.decorator';

@Controller('members')
export class MemberShipsController {
  constructor(private readonly membershipsService: MemberShipService) {}

  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN, MembershipRole.MEMBER)
  @Get()
  list() {
    return this.membershipsService.listMember();
  }
}
