import { Module } from '@nestjs/common';
import { InvitationController } from './invitation.controller';
import { InvitationsService } from './invitations.service';

@Module({
  controllers: [InvitationController],
  providers: [InvitationsService],
})
export class InvitationModule {}
