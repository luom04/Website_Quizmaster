import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      // 1. Cấu hình lấy Token từ Cookie
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          let token = null;
          if (req && req.cookies) {
            token = req.cookies['refreshToken'];
          }
          return token;
        },
      ]),
      secretOrKey: process.env.RT_SECRET,
      passReqToCallback: true, // Cho phép lấy req trong hàm validate
    });
  }

  validate(req: Request, payload: any) {
    // 2. Lấy lại token từ cookie để đưa vào request.user
    const refreshToken = req.cookies?.['refreshToken'];

    if (!refreshToken) {
      throw new ForbiddenException('Refresh token missing');
    }

    return {
      ...payload,
      refreshToken,
    };
  }
}
