import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, ResetPasswordDto } from './dto/auth.dto';
import { Tokens, RegisterResponse } from './types/tokens.type';
import { Public } from '../../common/decorators/public.decorator';
import { GetCurrentUser } from '../../common/decorators/get-current-user.decorator';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import type { Response } from 'express';
import { Res } from '@nestjs/common';
import { SetCookieInterceptor } from './interceptors/set-cookie.interceptor';

function getRefreshTokenClearCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ('none' as const) : ('lax' as const),
    path: '/',
  };
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: AuthDto): Promise<RegisterResponse> {
    return this.authService.register(dto);
  }

  @Public()
  @UseInterceptors(SetCookieInterceptor)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: AuthDto): Promise<Tokens> {
    return this.authService.login(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @GetCurrentUser('sub') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(userId);
    res.clearCookie('refreshToken', getRefreshTokenClearCookieOptions());
    return { success: true };
  }

  @Public()
  @UseInterceptors(SetCookieInterceptor)
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(
    @GetCurrentUser('sub') userId: string,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ): Promise<Tokens> {
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(
      dto.email,
      dto.recoveryCode,
      dto.newPassword,
    );
  }
}
