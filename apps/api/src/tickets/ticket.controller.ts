import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreatTicketDto } from './dto/create-ticket.dto';
import { ListTicketsQueryDto } from './dto/list-tickets-query.dto';
import { MembershipRole } from 'src/common/enums';
import { Roles } from 'src/common/decorator/roles.decorator';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { AssignTicketDto } from './dto/assign-ticket.dto';

const STAFF = [
  MembershipRole.OWNER,
  MembershipRole.ADMIN,
  MembershipRole.MEMBER,
];
@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketsService: TicketService) {}

  @Post()
  create(@Body() dto: CreatTicketDto) {
    return this.ticketsService.create(dto);
  }

  @Get()
  list(@Query() query: ListTicketsQueryDto) {
    return this.ticketsService.list(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ticketsService.findOne(id);
  }

  @Roles(...STAFF)
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTicketDto) {
    return this.ticketsService.update(id, dto);
  }

  @Roles(...STAFF)
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTicketStatusDto,
  ) {
    return this.ticketsService.updateStatus(id, dto);
  }

  @Roles(...STAFF)
  @Patch(':id/assignee')
  assign(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AssignTicketDto) {
    return this.ticketsService.assign(id, dto);
  }
}
