import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/db/prisma.service';
import { JwtPayload, LoginInput } from 'src/shared/types';
import { UsersService } from 'src/users/users.service';

const SALT_ROUNDS = 10;

type TokenResponse = {
  status: string;
  value: string;
};

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
      throw new BadRequestException('User not found');
    }

    const isMatch = bcrypt.compareSync(password, user.password);

    if (!isMatch) {
      throw new BadRequestException('Password does not match');
    }

    const { password: _, ...userWithoutPassword } = user;

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

    return {
      user,
      accessToken: tokens.accessToken.value,
      refreshToken: tokens.refreshToken.value,
    };
  }

  async refreshToken(refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedException();

    try {
      const payload: JwtPayload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET as string,
      });

      const newAccessToken = await this.jwtService.signAsync(
        { sub: payload.sub, email: payload.email, role: payload.role },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: process.env.JWT_EXPIRES_IN,
        },
      );

      return newAccessToken;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(user: {
    id: string;
    email: string;
    role: Role;
  }) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const [accessToken, refreshToken] = await Promise.allSettled([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
      }),
    ]);

    return {
      accessToken: accessToken as TokenResponse,
      refreshToken: refreshToken as TokenResponse,
    };
  }
}
