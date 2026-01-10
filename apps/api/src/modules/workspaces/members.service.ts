import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MemberRole } from '@prisma/client';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  async findAll(workspaceId: string) {
    return this.prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            createdAt: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' }, // OWNER first
        { joinedAt: 'asc' },
      ],
    });
  }

  async updateRole(workspaceId: string, userId: string, dto: UpdateMemberRoleDto, currentUserRole: MemberRole) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Can't change your own role
    if (member.userId === userId) {
      throw new ForbiddenException('Cannot change your own role');
    }

    // Only OWNER can assign OWNER role
    if (dto.role === MemberRole.OWNER && currentUserRole !== MemberRole.OWNER) {
      throw new ForbiddenException('Only owners can assign owner role');
    }

    // If demoting an OWNER, ensure there's at least one other OWNER
    if (member.role === MemberRole.OWNER && dto.role !== MemberRole.OWNER) {
      const ownerCount = await this.prisma.workspaceMember.count({
        where: {
          workspaceId,
          role: MemberRole.OWNER,
        },
      });

      if (ownerCount <= 1) {
        throw new BadRequestException('Workspace must have at least one owner');
      }
    }

    return this.prisma.workspaceMember.update({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
      data: {
        role: dto.role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async remove(workspaceId: string, userId: string, currentUserId: string) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // If removing an OWNER, ensure there's at least one other OWNER
    if (member.role === MemberRole.OWNER) {
      const ownerCount = await this.prisma.workspaceMember.count({
        where: {
          workspaceId,
          role: MemberRole.OWNER,
        },
      });

      if (ownerCount <= 1) {
        throw new BadRequestException('Workspace must have at least one owner');
      }
    }

    await this.prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    return { success: true };
  }
}
