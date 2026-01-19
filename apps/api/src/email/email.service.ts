import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly config: ConfigService) {}

  private getTransporter() {
    if (this.transporter) return this.transporter;

    const host = this.config.get<string>('SMTP_HOST') || 'localhost';
    const port = Number(this.config.get<string>('SMTP_PORT') || 1025);
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    const secure = port === 465;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
    });

    return this.transporter;
  }

  private getFromAddress(): string {
    return this.config.get<string>('EMAIL_FROM') || 'My Life Finance <noreply@mylifefinance.run.place>';
  }

  private getAppUrl(): string {
    return (
      this.config.get<string>('APP_URL') ||
      this.config.get<string>('FRONTEND_URL') ||
      this.config.get<string>('CORS_ORIGIN') ||
      'http://localhost:5173'
    ).replace(/\/$/, '');
  }

  async sendWelcomeEmail(user: { email: string; name: string }) {
    try {
      const transporter = this.getTransporter();
      const appUrl = this.getAppUrl();

      await transporter.sendMail({
        from: this.getFromAddress(),
        to: user.email,
        subject: 'Bem-vindo ao My Life Finance!',
        text: `
Olá ${user.name}!

Bem-vindo ao My Life Finance! Estamos felizes em tê-lo conosco.

Sua conta foi criada com sucesso. Agora você pode começar a organizar suas finanças de forma simples e eficiente.

Acesse sua conta em: ${appUrl}

Se você tiver qualquer dúvida, não hesite em nos contatar.

Atenciosamente,
Equipe My Life Finance
        `.trim(),
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 14px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Bem-vindo ao My Life Finance!</h1>
    </div>
    <div class="content">
      <p>Olá <strong>${user.name}</strong>!</p>
      <p>Estamos muito felizes em tê-lo conosco. Sua conta foi criada com sucesso!</p>
      <p>Agora você pode começar a organizar suas finanças de forma simples e eficiente.</p>
      <p style="text-align: center;">
        <a href="${appUrl}" class="button">Acessar Minha Conta</a>
      </p>
      <p>Se você tiver qualquer dúvida, não hesite em nos contatar.</p>
    </div>
    <div class="footer">
      <p>Atenciosamente,<br>Equipe My Life Finance</p>
    </div>
  </div>
</body>
</html>
        `.trim(),
      });

      console.log(`[Email] Welcome email sent to ${user.email}`);
    } catch (err) {
      console.error('[Email] Failed to send welcome email:', (err as Error).message);
    }
  }

  async sendEmail(options: {
    to: string;
    subject: string;
    text: string;
    html?: string;
  }) {
    try {
      const transporter = this.getTransporter();

      await transporter.sendMail({
        from: this.getFromAddress(),
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      console.log(`[Email] Email sent to ${options.to}`);
    } catch (err) {
      console.error('[Email] Failed to send email:', (err as Error).message);
    }
  }
}
