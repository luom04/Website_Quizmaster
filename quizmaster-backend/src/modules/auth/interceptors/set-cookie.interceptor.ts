import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

import { Tokens } from '../types/tokens.type';

function getRefreshTokenCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ('none' as const) : ('lax' as const),
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
}

@Injectable()
export class SetCookieInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const res = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data: Tokens) => {
        if (data && data.refresh_token) {
          res.cookie(
            'refreshToken',
            data.refresh_token,
            getRefreshTokenCookieOptions(),
          );
        }

        const { refresh_token, ...rest } = data;
        return rest;
      }),
    );
  }
}
