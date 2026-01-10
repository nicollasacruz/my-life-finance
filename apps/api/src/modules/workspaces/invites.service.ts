import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InviteMemberDto } from './dto/invite-member.dto';
import { MemberRole } from '@prisma/client';
import { randomBytes } from 'crypto';

@Injectable()
export class InvitesService {
  constructor(private prisma: PrismaService) {}

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

    // TODO: Send email with invite link
    // For now, we'll just return the invite with token
    // In production, send email via Resend

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

    if (invite.status !== 'PENDING') {
      throw new BadRequestException('Can only cancel pending invites');
    }

    await this.prisma.workspaceInvite.update({
      where: { id: inviteId },
      data: {
        status: 'CANCELLED',
      },
    });

    return { success: true };
  }
}
