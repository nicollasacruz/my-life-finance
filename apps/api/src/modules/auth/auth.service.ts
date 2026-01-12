import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

const REFRESH_COOKIE_NAME = 'mlf_refresh_token';

@Injectable()
export class AuthService {
  private readonly accessTtl: string;
  private readonly refreshTtl: string;
  private readonly refreshTtlMs: number;
  private readonly isProd: boolean;
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;
  readonly refreshCookieName = REFRESH_COOKIE_NAME;

  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {
    this.accessTtl = this.configService.get<string>('JWT_EXPIRES_IN') || '15m';
    this.refreshTtl = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';
    this.refreshTtlMs = this.parseDurationToMs(this.refreshTtl);
    this.isProd = this.configService.get<string>('NODE_ENV') === 'production';
    this.jwtSecret = this.configService.get<string>('JWT_SECRET') || 'changeme';
    this.jwtRefreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') || this.jwtSecret;
  }

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
    });

    // Create default personal workspace for new user
    await this.prisma.workspace.create({
      data: {
        name: 'Meu Espaço Pessoal',
        type: 'PERSONAL',
        members: {
          create: {
            userId: user.id,
            role: 'OWNER',
          },
        },
      },
    });

    return this.issueTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens(user);
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const payload = await this.verifyRefreshToken(refreshToken);
    const stored = await this.findValidRefreshToken(payload.sub, refreshToken);
    if (!stored) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Single-use rotation: revoke old token
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.issueTokens(user);
  }

  async logout(refreshToken: string | undefined | null) {
    if (!refreshToken) return;

    const payload = await this.safeVerifyRefresh(refreshToken);
    if (!payload?.sub) return;

    const stored = await this.findValidRefreshToken(payload.sub, refreshToken);
    if (!stored) return;

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });
  }

  sanitizeUser(user: User) {
    const { passwordHash, ...rest } = user;
    return rest;
  }

  extractRefreshTokenFromRequest(req: { cookies?: Record<string, string> }): string | null {
    return req.cookies?.[REFRESH_COOKIE_NAME] || null;
  }

  getRefreshCookieOptions() {
    const options = {
      httpOnly: true,
      secure: this.isProd,
      sameSite: this.isProd ? ('none' as const) : ('lax' as const),
      maxAge: this.refreshTtlMs,
      path: '/',
      // Don't set domain in development (localhost)
      // domain: undefined,
    };

    console.log('[Auth] Cookie options:', {
      ...options,
      maxAge: `${this.refreshTtlMs}ms (${this.refreshTtl})`,
      isProd: this.isProd,
    });

    return options;
  }

  private async issueTokens(user: User) {
    const accessToken = await this.signAccessToken(user);
    const refreshToken = await this.signRefreshToken(user);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  private async signAccessToken(user: User) {
    const payload: JwtPayload = { sub: user.id, email: user.email, type: 'access' };
    return this.jwtService.signAsync(payload, {
      secret: this.jwtSecret,
      expiresIn: this.accessTtl,
    });
  }

  private async signRefreshToken(user: User) {
    const jti = randomUUID();
    const payload: JwtPayload = { sub: user.id, email: user.email, type: 'refresh', jti };
    const token = await this.jwtService.signAsync(payload, {
      secret: this.jwtRefreshSecret,
      expiresIn: this.refreshTtl,
    });

    const hashedToken = await bcrypt.hash(token, 10);
    const expiresAt = new Date(Date.now() + this.refreshTtlMs);
    await this.prisma.refreshToken.create({
      data: {
        token: hashedToken,
        userId: user.id,
        expiresAt,
      },
    });

    return token;
  }

  private async verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.jwtRefreshSecret,
      });

      if (payload.type && payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token type');
      }

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async safeVerifyRefresh(token: string): Promise<JwtPayload | null> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.jwtRefreshSecret,
      });
    } catch {
      return null;
    }
  }

  private async findValidRefreshToken(userId: string, token: string): Promise<RefreshToken | null> {
    const candidates = await this.prisma.refreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    for (const candidate of candidates) {
      const match = await bcrypt.compare(token, candidate.token);
      if (match) {
        return candidate;
      }
    }

    return null;
  }

  private parseDurationToMs(value: string | number): number {
    if (typeof value === 'number') return value;
    const match = /^([0-9]+)\s*(ms|s|m|h|d)?$/i.exec(value.trim());
    if (!match) {
      throw new BadRequestException('Invalid duration format');
    }
    const amount = Number(match[1]);
    const unit = (match[2] || 'ms').toLowerCase();
    switch (unit) {
      case 'ms':
        return amount;
      case 's':
        return amount * 1000;
      case 'm':
        return amount * 1000 * 60;
      case 'h':
        return amount * 1000 * 60 * 60;
      case 'd':
        return amount * 1000 * 60 * 60 * 24;
      default:
        return amount;
    }
  }
}
