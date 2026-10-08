import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { MembershipRole } from 'src/common/enums/membership-role.enums';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Public } from 'src/common/decorator/public.decorator';
import { SkipTenant } from 'src/common/decorator/skip-tenant.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto);
  }

  @Public()
  @Post('logout')
  logout(@Body() dto: RefreshDto) {
    return this.authService.logout(dto);
  }

  @SkipTenant()
  @Get('me')
  getMe(@CurrentUser() user: { userId: string }) {
    return user;
  }

  @Get('/admin-only-test')
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN)
  adminOnlyTest(@CurrentUser() user: { userId: string }) {
    return { message: 'Bạn có quyền admin trở lên', userId: user.userId };
  }
}
