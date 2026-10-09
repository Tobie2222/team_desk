import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DataSource, IsNull } from 'typeorm';
import { SignupDto } from './dto/signup.dto';
import { User } from 'src/users/user.entity';
import { Organization } from 'src/organizations/ organizations.entity';
import { Membership } from 'src/memberships/membership.entity';
import { MembershipRole } from 'src/common/enums/membership-role.enums';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from './token.service';
import { RefreshToken } from './entities/refresh-token.entity';
import * as crypto from 'crypto';
import { RefreshDto } from './dto/refresh.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
  ) {}

  async signup(dto: SignupDto) {
    return this.dataSource.transaction(async (manager) => {
      const existing = await manager.findOne(User, {
        where: { email: dto.email },
      });
      if (existing) {
        throw new ConflictException('Email already in use');
      }

      const passwordHash = await bcrypt.hash(dto.password, 10);

      const user = manager.create(User, {
        email: dto.email,
        passwordHash,
        name: dto.name,
      });
      await manager.save(user);

      const organization = manager.create(Organization, {
        name: dto.organizationName,
        plan: 'free',
      });
      await manager.save(organization);

      const membership = manager.create(Membership, {
        userId: user.id,
        organizationId: organization.id,
        role: MembershipRole.OWNER,
      });
      await manager.save(membership);

      const safeUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      };
      return { user: safeUser, organization, membership };
    });
  }

  async login(dto: LoginDto) {
    const user = await this.dataSource.getRepository(User).findOne({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const { accessToken, refreshToken } = await this.tokenService.issueTokens(
      user.id,
      this.dataSource.manager,
    );
    return { accessToken, refreshToken };
  }

  async refresh(dto: RefreshDto) {
    const tokenHash = crypto
      .createHash('sha256')
      .update(dto.refreshToken)
      .digest('hex');
    const tokenRow = await this.dataSource.manager.findOne(RefreshToken, {
      where: { tokenHash },
    });

    if (!tokenRow) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (tokenRow.revokedAt) {
      await this.dataSource.manager.update(
        RefreshToken,
        { userId: tokenRow.userId, revokedAt: IsNull() },
        { revokedAt: new Date() },
      );
      throw new UnauthorizedException(
        'Refresh token reuse detected — all sessions revoked',
      );
    }

    if (tokenRow.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    return this.dataSource.transaction(async (manager) => {
      const { accessToken, refreshToken, refreshTokenRow } =
        await this.tokenService.issueTokens(tokenRow.userId, manager);

      tokenRow.revokedAt = new Date();
      tokenRow.replacedBy = refreshTokenRow.id;
      await manager.save(tokenRow);

      return { accessToken, refreshToken };
    });
  }

  async logout(dto: RefreshDto) {
    const tokenHash = crypto
      .createHash('sha256')
      .update(dto.refreshToken)
      .digest('hex');
    await this.dataSource.manager.update(
      RefreshToken,
      { tokenHash, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
    return { success: true, message: 'Logged out successfully' };
  }

  async getProfile(userId: string) {
    const user = await this.dataSource.manager.findOne(User, {
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException();
    }

    const memberships = await this.dataSource
      .createQueryBuilder()
      .select('m.organizationId', 'organizationId')
      .addSelect('o.name', 'organizationName')
      .addSelect('m.role', 'role')
      .from(Membership, 'm')
      .innerJoin(Organization, 'o', 'o.id = m.organizationId')
      .where('m.userId = :userId', { userId })
      .getRawMany<{
        organizationId: string;
        organizationName: string;
        role: MembershipRole;
      }>();

    return { id: user.id, email: user.email, name: user.name, memberships };
  }
}
