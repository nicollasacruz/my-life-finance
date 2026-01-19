import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { InviteMemberDto } from './dto/invite-member.dto';
import { MemberRole } from '@prisma/client';
import { randomBytes } from 'crypto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class InvitesService {
  private transporter: nodemailer.Transporter | null = null;

  constructor(private prisma: PrismaService, private config: ConfigService) {}

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

  private async sendInviteEmail(invite: {
    email: string;
    token: string;
    workspaceName: string;
    invitedBy: string;
  }) {
    try {
      const transporter = this.getTransporter();
      const from = this.config.get<string>('EMAIL_FROM') || 'My Life Finance <noreply@example.com>';
      const appUrl =
        this.config.get<string>('APP_URL') ||
        this.config.get<string>('CORS_ORIGIN') ||
        'http://localhost:5173';
      const inviteUrl = `${appUrl.replace(/\/$/, '')}/invite/${invite.token}`;

      await transporter.sendMail({
        from,
        to: invite.email,
        subject: 'Você foi convidado para um workspace no My Life Finance',
        text: [
          'Olá!',
          `${invite.invitedBy} convidou você para entrar no workspace "${invite.workspaceName}" no My Life Finance.`,
          'Aceite o convite para colaborar nas finanças compartilhadas.',
          `Abrir convite: ${inviteUrl}`,
          'Se você não esperava este email, basta ignorar.',
        ].join('\n\n'),
        html: `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f8fa;padding:24px 0;">
            <tr>
              <td align="center">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:32px;font-family:Arial, sans-serif;color:#111827;box-shadow:0 10px 35px rgba(15, 23, 42, 0.08);">
                  <tr>
                    <td style="text-align:center;padding-bottom:24px;">
                      <div style="display:inline-flex;align-items:center;gap:10px;">
                        <div style="width:36px;height:36px;border-radius:12px;background:#1d4ed8;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:16px;">ML</div>
                        <span style="font-size:18px;font-weight:700;">My Life Finance</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size:16px;line-height:1.6;padding-bottom:16px;">
                      <p style="margin:0 0 12px 0;">Olá!</p>
                      <p style="margin:0 0 12px 0;"><strong>${invite.invitedBy}</strong> convidou você para entrar no workspace <strong>${invite.workspaceName}</strong> no My Life Finance.</p>
                      <p style="margin:0 0 12px 0;">Aceite o convite para colaborar nas finanças compartilhadas.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="text-align:center;padding:12px 0 20px 0;">
                      <a href="${inviteUrl}" style="display:inline-block;background:#1d4ed8;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:700;">Aceitar convite</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size:14px;color:#4b5563;padding-top:8px;padding-bottom:16px;">
                      Ou copie e cole este link no navegador:<br />
                      <span style="display:inline-block;margin-top:6px;padding:8px 10px;background:#f3f4f6;border-radius:8px;font-family:monospace;color:#1f2937;">${inviteUrl}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size:13px;color:#6b7280;border-top:1px solid #e5e7eb;padding-top:16px;">
                      Se você não esperava este email, pode ignorá-lo. O convite expira automaticamente em 7 dias.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        `,
      });
    } catch (err) {
      // Log and continue; invite record still exists
      console.error('[Invites] Failed to send invite email:', (err as Error).message);
    }
  }

  async create(workspaceId: string, invitedById: string, dto: InviteMemberDto) {
    // Check if user is already a member
    const existingMember = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        user: {
          email: dto.email.toLowerCase(),
        },
      },
    });

    if (existingMember) {
      throw new ConflictException('User is already a member');
    }

    // Check if there's already a pending invite
    const existingInvite = await this.prisma.workspaceInvite.findFirst({
      where: {
        workspaceId,
        email: dto.email.toLowerCase(),
        status: 'PENDING',
      },
    });

    if (existingInvite) {
      throw new ConflictException('Invite already sent to this email');
    }

    // Generate unique token
    const token = randomBytes(32).toString('hex');

    // Create invite (expires in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = await this.prisma.workspaceInvite.create({
      data: {
        workspaceId,
        email: dto.email.toLowerCase(),
        role: dto.role || MemberRole.MEMBER,
        token,
        invitedById,
        expiresAt,
      },
      include: {
        workspace: true,
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await this.sendInviteEmail({
      email: invite.email,
      token: invite.token,
      workspaceName: invite.workspace.name,
      invitedBy: invite.invitedBy?.name || invite.invitedBy?.email || 'Um membro do workspace',
    });

    return invite;
  }

  async findAll(workspaceId: string) {
    return this.prisma.workspaceInvite.findMany({
      where: { workspaceId },
      include: {
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getByToken(token: string) {
    let invite = await this.prisma.workspaceInvite.findUnique({
      where: { token },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    const now = new Date();
    if (invite.status === 'PENDING' && now > invite.expiresAt) {
      invite = await this.prisma.workspaceInvite.update({
        where: { id: invite.id },
        data: { status: 'EXPIRED' },
        include: {
          workspace: {
            select: { id: true, name: true, slug: true },
          },
          invitedBy: {
            select: { id: true, name: true, email: true },
          },
        },
      });
    }

    const registeredUser = await this.prisma.user.findUnique({
      where: { email: invite.email },
      select: { id: true },
    });

    return {
      id: invite.id,
      email: invite.email,
      role: invite.role,
      status: invite.status,
      expiresAt: invite.expiresAt,
      createdAt: invite.createdAt,
      workspace: invite.workspace,
      invitedBy: invite.invitedBy,
      isRegistered: !!registeredUser,
      isExpired: invite.status === 'EXPIRED',
    };
  }

  async accept(token: string, userId: string) {
    const invite = await this.prisma.workspaceInvite.findUnique({
      where: { token },
      include: {
        workspace: true,
      },
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.status !== 'PENDING') {
      throw new BadRequestException('Invite is no longer valid');
    }

    if (new Date() > invite.expiresAt) {
      await this.prisma.workspaceInvite.update({
        where: { id: invite.id },
        data: { status: 'EXPIRED' },
      });
      throw new BadRequestException('Invite has expired');
    }

    // Get user email to verify
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.email.toLowerCase() !== invite.email) {
      throw new BadRequestException('This invite is for a different email address');
    }

    // Check if already a member
    const existingMember = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: invite.workspaceId,
          userId,
        },
      },
    });

    if (existingMember) {
      throw new ConflictException('Already a member of this workspace');
    }

    // Add user to workspace and mark invite as accepted
    const [member] = await this.prisma.$transaction([
      this.prisma.workspaceMember.create({
        data: {
          workspaceId: invite.workspaceId,
          userId,
          role: invite.role,
        },
        include: {
          workspace: true,
        },
      }),
      this.prisma.workspaceInvite.update({
        where: { id: invite.id },
        data: {
          status: 'ACCEPTED',
          respondedAt: new Date(),
        },
      }),
    ]);

    return member;
  }

  async decline(token: string, userId: string) {
    const invite = await this.prisma.workspaceInvite.findUnique({
      where: { token },
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.status !== 'PENDING') {
      throw new BadRequestException('Invite is no longer valid');
    }

    // Verify email matches
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.email.toLowerCase() !== invite.email) {
      throw new BadRequestException('This invite is for a different email address');
    }

    await this.prisma.workspaceInvite.update({
      where: { id: invite.id },
      data: {
        status: 'DECLINED',
        respondedAt: new Date(),
      },
    });

    return { success: true };
  }

  async cancel(inviteId: string) {
    const invite = await this.prisma.workspaceInvite.findUnique({
      where: { id: inviteId },
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    // Treat non-pending invites as already handled to keep the operation idempotent
    if (invite.status !== 'PENDING') {
      return { success: true, status: invite.status };
    }

    await this.prisma.workspaceInvite.update({
      where: { id: inviteId },
      data: {
        status: 'CANCELLED',
      },
    });

    return { success: true, status: 'CANCELLED' };
  }

  async resend(token: string) {
    const invite = await this.prisma.workspaceInvite.findUnique({
      where: { token },
      include: {
        workspace: true,
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.status !== 'PENDING') {
      throw new BadRequestException('Invite is no longer valid');
    }

    if (new Date() > invite.expiresAt) {
      await this.prisma.workspaceInvite.update({
        where: { id: invite.id },
        data: { status: 'EXPIRED' },
      });
      throw new BadRequestException('Invite has expired');
    }

    await this.sendInviteEmail({
      email: invite.email,
      token: invite.token,
      workspaceName: invite.workspace.name,
      invitedBy:
        invite.invitedBy?.name ||
        invite.invitedBy?.email ||
        'Um membro do workspace',
    });

    return { success: true, message: 'Email reenviado com sucesso' };
  }
}
