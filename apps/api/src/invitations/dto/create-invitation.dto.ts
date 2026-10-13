import { IsEmail, IsIn } from 'class-validator';
import { MembershipRole } from 'src/common/enums/membership-role.enums';

export class CreateInvitationDto {
  @IsEmail()
  email!: string;

  @IsIn([MembershipRole.ADMIN, MembershipRole.MEMBER, MembershipRole.CUSTOMER])
  role!: MembershipRole;
}
