import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { user, accessToken, refreshToken } = await this.authService.register(dto);
    res.cookie(
      this.authService.refreshCookieName,
      refreshToken,
      this.authService.getRefreshCookieOptions()
    );
    return { user, accessToken };
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, accessToken, refreshToken } = await this.authService.login(dto);
    res.cookie(
      this.authService.refreshCookieName,
      refreshToken,
      this.authService.getRefreshCookieOptions()
    );
    return { user, accessToken };
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = this.authService.extractRefreshTokenFromRequest(req);
    const { user, accessToken, refreshToken: newRefresh } = await this.authService.refresh(
      refreshToken || ''
    );
    res.cookie(
      this.authService.refreshCookieName,
      newRefresh,
      this.authService.getRefreshCookieOptions()
    );
    return { user, accessToken };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = this.authService.extractRefreshTokenFromRequest(req);
    await this.authService.logout(refreshToken);
    res.clearCookie(this.authService.refreshCookieName, this.authService.getRefreshCookieOptions());
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: Request) {
    const userId = (req as any).user?.userId as string;
    const user = userId ? await this.usersService.findById(userId) : null;
    return user ? this.authService.sanitizeUser(user) : null;
  }
}
