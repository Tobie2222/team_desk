import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './ticket.entity';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';
import { MemberShipModule } from 'src/memberships/membership.module';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket]), MemberShipModule],
  controllers: [TicketController],
  providers: [TicketService],
})
export class TicketModule {}
