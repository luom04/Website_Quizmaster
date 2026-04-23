// src/modules/auth/mail.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist/config.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: 587,
      secure: false,
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
  }

  async sendResetPasswordEmail(to: string, token: string) {
    // URL này dẫn về trang Reset Password ở FRONTEND của bạn
    const url = `http://localhost:3000/reset-password?token=${token}`;
    await this.transporter.sendMail({
      from: '"QuizMaster" <noreply@quizmaster.com>',
      to,
      subject: 'Reset Your Password',
      html: `
        <h3>Yêu cầu đặt lại mật khẩu</h3>
        <p>Bạn nhận được email này vì đã yêu cầu đặt lại mật khẩu cho tài khoản QuizMaster.</p>
        <p>Vui lòng click vào đường dẫn dưới đây để thực hiện (Hết hạn sau 15 phút):</p>
        <a href="${url}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none;">Đặt lại mật khẩu</a>
      `,
    });
  }
}
