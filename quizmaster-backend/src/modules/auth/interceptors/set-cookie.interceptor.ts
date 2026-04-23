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

@Injectable()
export class SetCookieInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const res = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data: Tokens) => {
        // 1. Kiểm tra nếu Service có trả về refresh_token
        if (data && data.refresh_token) {
          res.cookie('refreshToken', data.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
          });
        }

        // 2. Xóa refresh_token khỏi Body trước khi gửi về cho Client
        const { refresh_token, ...rest } = data;
        return rest;
      }),
    );
  }
}
