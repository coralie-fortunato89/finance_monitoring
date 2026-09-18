import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export type PublicUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
};

const ACCESS_TTL = '15m';
const ACCESS_MAX_AGE_MS = 15 * 60 * 1000;
const REFRESH_TTL_DAYS = 7;
const REFRESH_MAX_AGE_MS = REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000;
const BCRYPT_COST = 12;
/** Concurrent refresh losers within this window are not treated as reuse attacks. */
const REFRESH_RACE_GRACE_MS = 5_000;

@Injectable()
export class AuthService {
  private readonly dummyPasswordHashPromise = bcrypt.hash(
    '__timing_dummy__',
    BCRYPT_COST,
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  get accessMaxAgeMs(): number {
    return ACCESS_MAX_AGE_MS;
  }

  get refreshMaxAgeMs(): number {
    return REFRESH_MAX_AGE_MS;
  }

  async register(dto: RegisterDto): Promise<AuthTokens> {
    const email = dto.email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_COST);

    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          passwordHash,
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
        },
      });
      return this.issueTokens(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Un compte existe déjà avec cet email.');
      }
      throw error;
    }
  }

  async login(dto: LoginDto): Promise<AuthTokens> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    const dummyHash = await this.dummyPasswordHashPromise;
    const hashToCompare = user?.passwordHash ?? dummyHash;
    const ok = await bcrypt.compare(dto.password, hashToCompare);

    if (!user || !ok) {
      throw new UnauthorizedException('Email ou mot de passe incorrect.');
    }

    return this.issueTokens(user);
  }

  async me(userId: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Session invalide.');
    }
    return this.toPublicUser(user);
  }

  async refresh(rawRefreshToken: string | undefined): Promise<AuthTokens> {
    if (!rawRefreshToken) {
      throw new UnauthorizedException('Session invalide.');
    }

    const tokenHash = this.hashToken(rawRefreshToken);

    return this.prisma.$transaction(async (tx) => {
      const stored = await tx.refreshToken.findUnique({
        where: { tokenHash },
        include: { user: true },
      });

      if (!stored) {
        throw new UnauthorizedException('Session invalide.');
      }

      if (stored.revokedAt) {
        throw new UnauthorizedException('Session invalide.');
      }

      if (stored.replacedAt) {
        const age = Date.now() - stored.replacedAt.getTime();
        if (age > REFRESH_RACE_GRACE_MS) {
          await tx.refreshToken.updateMany({
            where: { familyId: stored.familyId, revokedAt: null },
            data: { revokedAt: new Date() },
          });
        }
        throw new UnauthorizedException('Session invalide.');
      }

      if (stored.expiresAt.getTime() <= Date.now()) {
        await tx.refreshToken.update({
          where: { id: stored.id },
          data: { revokedAt: new Date() },
        });
        throw new UnauthorizedException('Session invalide.');
      }

      const claimed = await tx.refreshToken.updateMany({
        where: { id: stored.id, replacedAt: null, revokedAt: null },
        data: { replacedAt: new Date() },
      });

      if (claimed.count !== 1) {
        throw new UnauthorizedException('Session invalide.');
      }

      return this.issueTokens(stored.user, stored.familyId, tx);
    });
  }

  async logout(rawRefreshToken: string | undefined): Promise<void> {
    if (!rawRefreshToken) {
      return;
    }
    const tokenHash = this.hashToken(rawRefreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });
    if (!stored) {
      return;
    }
    await this.prisma.refreshToken.updateMany({
      where: { familyId: stored.familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async issueTokens(
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    },
    familyId: string = crypto.randomUUID(),
    tx: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<AuthTokens> {
    const accessToken = this.jwt.sign(
      { sub: user.id, email: user.email },
      { expiresIn: ACCESS_TTL, algorithm: 'HS256' },
    );

    const refreshToken = crypto.randomBytes(48).toString('base64url');
    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + REFRESH_MAX_AGE_MS);

    await tx.refreshToken.create({
      data: {
        familyId,
        tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: this.toPublicUser(user),
    };
  }

  private hashToken(raw: string): string {
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  private toPublicUser(user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  }): PublicUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}
