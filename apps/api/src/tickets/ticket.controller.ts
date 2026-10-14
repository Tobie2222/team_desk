import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreatTicketDto } from './dto/create-ticket.dto';
import { ListTicketsQueryDto } from './dto/list-tickets-query.dto';

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
}
