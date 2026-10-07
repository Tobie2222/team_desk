import { Module } from '@nestjs/common';
import { User } from 'src/users/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { Membership } from 'src/memberships/membership.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { Organization } from 'src/organizations/ organizations.entity';
import { TokenService } from './token.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Organization, Membership, RefreshToken]),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),

        signOptions: {
          expiresIn: configService.getOrThrow<string>(
            'JWT_ACCESS_EXPIRES_IN',
          ) as StringValue,
        },
      }),
    }),
  ],

  controllers: [AuthController],
  providers: [AuthService, TokenService],
})
export class AuthModule {}
