import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { type Request, type Response, type CookieOptions } from 'express';
import { loginSchema, userSchema } from 'src/shared/schemas/user.schema';
import { JwtUser, LoginInput, ValidUser } from 'src/shared/types';
import { ZodPipe } from 'src/shared/zod-pipe/zod.pipe';
import { AuthService } from './auth.service';
import { User } from './decorators/user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

const REFRESH_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

@Throttle({ default: { limit: 10, ttl: 60_000 } })
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body(new ZodPipe(userSchema)) user: ValidUser) {
    const { repeatPassword: _, ...userPayload } = user;

    const createdUser = await this.authService.register(userPayload);

    if (createdUser) {
      return { message: 'User created' };
    }
  }

  @Post('login')
  async login(
    @Body(new ZodPipe(loginSchema)) credentials: LoginInput,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.login(credentials);
    const { refreshToken, ...restOfUser } = user;

    if (user) {
      res.cookie('refresh_token', refreshToken, REFRESH_COOKIE_OPTIONS);
      return { ...restOfUser, message: 'Logged In' };
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @User() user: JwtUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.revokeRefreshToken(user.id);
    res.clearCookie('refresh_token');

    return { message: 'Logged out' };
  }

  @Post('refresh')
  async refreshAccessToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refresh_token'];

    const tokens = await this.authService.refreshToken(refreshToken);

    if (tokens.refreshToken) {
      res.cookie('refresh_token', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);
    }

    return { accessToken: tokens.accessToken };
  }
}
