import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import type { StringValue } from 'ms';
import { PrismaService } from 'src/db/prisma.service';
import { JwtPayload, LoginInput } from 'src/shared/types';
import { UsersService } from 'src/users/users.service';

const SALT_ROUNDS = 10;
const ROTATION_GRACE_MS = 30 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findOneByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = bcrypt.compareSync(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const {
      password: _password,
      refreshTokenHash: _hash,
      prevRefreshTokenHash: _prevHash,
      refreshRotatedAt: _rotatedAt,
      ...userWithoutPassword
    } = user;

    return userWithoutPassword;
  }

  async register(user: Prisma.UserCreateInput) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: user.email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);

    const newUser = { ...user, password: hashedPassword, role: Role.USER };

    return await this.userService.create(newUser);
  }

  async login(credentials: LoginInput) {
    const user = await this.validateUser(
      credentials.email,
      credentials.password,
    );

    const tokens = await this.generateTokens(user);
    await this.storeRefreshTokenHash(user.id, tokens.refreshToken);

    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedException();

    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET as string,
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const presentedHash = this.hashToken(refreshToken);

    if (presentedHash === user.refreshTokenHash) {
      const tokens = await this.generateTokens({
        id: user.id,
        email: user.email,
        role: user.role,
      });
      await this.storeRefreshTokenHash(
        user.id,
        tokens.refreshToken,
        user.refreshTokenHash,
      );

      return tokens;
    }

    const withinGrace =
      user.refreshRotatedAt !== null &&
      Date.now() - user.refreshRotatedAt.getTime() < ROTATION_GRACE_MS;

    if (presentedHash === user.prevRefreshTokenHash && withinGrace) {
      const accessToken = await this.jwtService.signAsync(
        { sub: user.id, email: user.email, role: user.role },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: process.env.JWT_EXPIRES_IN as StringValue,
        },
      );

      return { accessToken, refreshToken: null };
    }

    await this.revokeRefreshToken(user.id);
    throw new UnauthorizedException('Invalid refresh token');
  }

  async revokeRefreshToken(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshTokenHash: null,
        prevRefreshTokenHash: null,
        refreshRotatedAt: null,
      },
    });
  }

  private async generateTokens(user: {
    id: string;
    email: string;
    role: Role;
  }) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN as StringValue,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN as StringValue,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private async storeRefreshTokenHash(
    userId: string,
    refreshToken: string,
    previousHash: string | null = null,
  ) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshTokenHash: this.hashToken(refreshToken),
        prevRefreshTokenHash: previousHash,
        refreshRotatedAt: previousHash ? new Date() : null,
      },
    });
  }
}
