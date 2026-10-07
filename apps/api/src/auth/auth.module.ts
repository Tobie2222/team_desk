import { Module } from '@nestjs/common';
import { User } from 'src/users/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { Membership } from 'src/memberships/membership.entity';
import { Organization } from 'src/organizations/ organizations.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Organization, Membership, RefreshToken]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
