import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket } from './ticket.entity';
import { FindOptionsOrder, FindOptionsWhere, Repository } from 'typeorm';
import { TenantContextService } from 'src/common/tenant/tenant-context.service';
import { CreatTicketDto } from './dto/create-ticket.dto';
import { MembershipRole, TicketPriority, TicketStatus } from 'src/common/enums';
import { ListTicketsQueryDto } from './dto/list-tickets-query.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { MemberShipService } from 'src/memberships/membership.service';
import { canTransition } from './ticket-stat-machine';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private readonly repo: Repository<Ticket>,
    private readonly tenantContext: TenantContextService,
    private readonly membershipService: MemberShipService,
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

  async update(id: string, dto: UpdateTicketDto): Promise<Ticket> {
    const { organizationId } = this.tenantContext.get();

    const changes: Partial<Pick<Ticket, 'title' | 'description' | 'priority'>> =
      {};
    if (dto.title !== undefined) changes.title = dto.title;
    if (dto.description !== undefined) changes.description = dto.description;
    if (dto.priority !== undefined) changes.priority = dto.priority;
    if (Object.keys(changes).length === 0) {
      throw new BadRequestException('Nothing to update');
    }

    await this.findOne(id);
    await this.repo.update({ id, organizationId }, changes);
    return this.findOne(id);
  }

  async updateStatus(id: string, dto: UpdateTicketStatusDto): Promise<Ticket> {
    const { organizationId } = this.tenantContext.get();
    const ticket = await this.findOne(id);

    if (!canTransition(ticket.status, dto.status)) {
      throw new ConflictException(
        `Cannot change status from ${ticket.status} to ${dto.status}`,
      );
    }

    const result = await this.repo.update(
      { id, organizationId, status: ticket.status },
      { status: dto.status },
    );
    if (result.affected === 0) {
      throw new ConflictException(
        'Ticket was changed by someone else, please retry',
      );
    }
    return this.findOne(id);
  }

  async assign(id: string, dto: AssignTicketDto): Promise<Ticket> {
    const { organizationId } = this.tenantContext.get();

    if (dto.assigneeId !== null) {
      const role = await this.membershipService.findROleInCurrentOrganization(
        dto.assigneeId,
      );
      if (!role || role === MembershipRole.CUSTOMER) {
        throw new BadRequestException(
          'Assignee must be an owner, admin or member of this organization',
        );
      }
    }

    await this.repo.update(
      { id, organizationId },
      { assigneeId: dto.assigneeId },
    );
    return this.findOne(id);
  }
}
