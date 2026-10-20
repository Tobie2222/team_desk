import { TicketStatus } from 'src/common/enums';

const ALLOWED_TRANSITIONS: Record<TicketStatus, readonly TicketStatus[]> = {
  [TicketStatus.OPEN]: [TicketStatus.IN_PROGRESS, TicketStatus.CLOSED],
  [TicketStatus.IN_PROGRESS]: [TicketStatus.OPEN, TicketStatus.RESOLVED],
  [TicketStatus.RESOLVED]: [TicketStatus.IN_PROGRESS, TicketStatus.CLOSED],
  [TicketStatus.CLOSED]: [],
};

export function getAllowedTransition(
  from: TicketStatus,
): readonly TicketStatus[] {
  return ALLOWED_TRANSITIONS[from];
}

export function canTransition(from: TicketStatus, to: TicketStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}
