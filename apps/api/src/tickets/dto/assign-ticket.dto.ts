import { IsUUID, ValidateIf } from 'class-validator';

export class AssignTicketDto {
  @ValidateIf((o: AssignTicketDto) => o.assigneeId !== null)
  @IsUUID()
  assigneeId!: string | null;
}
