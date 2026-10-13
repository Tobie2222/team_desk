import { Body, Controller, Post } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { Roles } from 'src/common/decorator/roles.decorator';
import { MembershipRole } from 'src/common/enums/membership-role.enums';
import { SkipTenant } from 'src/common/decorator/skip-tenant.decorator';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';

@Controller('invitation')
export class InvitationController {
  constructor(private readonly invitationService: InvitationsService) {}

  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN)
  @Post()
  create(@Body() dto: CreateInvitationDto) {
    return this.invitationService.create(dto);
  }

  @SkipTenant()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('accept')
  accept(
    @CurrentUser() user: { userId: string },
    @Body() dto: AcceptInvitationDto,
  ) {
    return this.invitationService.accept(user.userId, dto);
  }
}
