import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { EntityManager } from 'typeorm';
import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { RefreshToken } from './entities/refresh-token.entity';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async issueTokens(userId: string, manager: EntityManager) {
    const accessToken = this.jwtService.sign({ sub: userId });

    const rawRefreshToken = crypto.randomBytes(64).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawRefreshToken)
      .digest('hex');

    const expiresInDays = this.configService.get<number>(
      'REFRESH_TOKEN_EXPIRES_IN_DAYS',
    );
    const expiresAt = new Date(
      Date.now() + expiresInDays! * 24 * 60 * 60 * 1000,
    );
    const refresTokenRow = manager.create(RefreshToken, {
      userId,
      tokenHash,
      expiresAt,
    });
    await manager.save(refresTokenRow);
    return {
      accessToken,
      refreshToken: rawRefreshToken,
      refreshTokenRow: refresTokenRow,
    };
  }
}
