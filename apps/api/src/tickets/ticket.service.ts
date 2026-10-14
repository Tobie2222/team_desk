import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket } from './ticket.entity';
import { FindOptionsOrder, FindOptionsWhere, Repository } from 'typeorm';
import { TenantContextService } from 'src/common/tenant/tenant-context.service';
import { CreatTicketDto } from './dto/create-ticket.dto';
import { MembershipRole, TicketPriority, TicketStatus } from 'src/common/enums';
import { ListTicketsQueryDto } from './dto/list-tickets-query.dto';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private readonly repo: Repository<Ticket>,
    private readonly tenantContext: TenantContextService,
  ) {}

  create(dto: CreatTicketDto) {
    const { organizationId, userId } = this.tenantContext.get();

    const ticket = this.repo.create({
      organizationId,
      requesterId: userId,
      title: dto.title,
      description: dto.description,
      priority: dto.priority ?? TicketPriority.MEDIUM,
      status: TicketStatus.OPEN,
    });
    return this.repo.save(ticket);
  }

  async list(query: ListTicketsQueryDto) {
    const { organizationId, userId, role } = this.tenantContext.get();

    const where: FindOptionsWhere<Ticket> = { organizationId };
    if (role === MembershipRole.CUSTOMER) {
      where.requesterId = userId;
    }

    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.assigneeId) where.assigneeId = query.assigneeId;

    const order = {
      [query.sortBy]: query.order,
      id: query.order,
    } as FindOptionsOrder<Ticket>;
    const [items, total] = await this.repo.findAndCount({
      where,
      order,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
    return { items, total, page: query.page, limit: query.limit };
  }

  async findOne(id: string) {
    const { organizationId, userId, role } = this.tenantContext.get();
    const where: FindOptionsWhere<Ticket> = { id, organizationId };

    if (role === MembershipRole.CUSTOMER) {
      where.requesterId = userId;
    }

    const ticket = await this.repo.findOne({ where });
    if (!ticket) {
      throw new NotFoundException('Ticket Not Found');
    }
    return ticket;
  }
}
