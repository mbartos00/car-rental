import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { type Request, type Response } from 'express';
import { loginSchema, userSchema } from 'src/shared/schemas/user.schema';
import { LoginInput, ValidUser } from 'src/shared/types';
import { ZodPipe } from 'src/shared/zod-pipe/zod.pipe';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

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
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return { ...restOfUser, message: 'Logged In' };
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token');

    return { message: 'Logged out' };
  }

  @Post('refresh')
  async refreshAccessToken(@Req() req: Request) {
    const refreshToken = req.cookies['refresh_token'];

    const accessToken = await this.authService.refreshToken(refreshToken);

    return { accessToken };
  }
}
