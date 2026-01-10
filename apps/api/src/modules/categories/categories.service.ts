import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(workspaceId: string, dto: CreateCategoryDto) {
    // Check if name already exists in workspace
    const existing = await this.prisma.category.findFirst({
      where: {
        workspaceId,
        name: dto.name,
      },
    });

    if (existing) {
      throw new ConflictException('Category name already exists in this workspace');
    }

    return this.prisma.category.create({
      data: {
        workspaceId,
        name: dto.name,
        color: dto.color || '#6B7280',
        icon: dto.icon,
      },
    });
  }

  async findAll(workspaceId: string) {
    return this.prisma.category.findMany({
      where: { workspaceId },
      include: {
        _count: {
          select: {
            accounts: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string, workspaceId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, workspaceId },
      include: {
        accounts: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, workspaceId: string, dto: UpdateCategoryDto) {
    // Verify category exists and belongs to workspace
    const category = await this.prisma.category.findFirst({
      where: { id, workspaceId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // If updating name, check for conflicts
    if (dto.name && dto.name !== category.name) {
      const existing = await this.prisma.category.findFirst({
        where: {
          workspaceId,
          name: dto.name,
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException('Category name already exists');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, workspaceId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, workspaceId },
      include: {
        _count: {
          select: {
            accounts: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Prevent deletion if category has accounts
    if (category._count.accounts > 0) {
      throw new BadRequestException(
        `Cannot delete category with ${category._count.accounts} account(s). Remove or reassign accounts first.`
      );
    }

    await this.prisma.category.delete({
      where: { id },
    });

    return { success: true };
  }
}
