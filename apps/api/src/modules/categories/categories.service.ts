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

  async seedDefaultCategories(workspaceId: string) {
    const defaultCategories = [
      // Habitação
      { name: 'Renda', color: '#EF4444', icon: '🏠' },
      { name: 'Condomínio', color: '#F97316', icon: '🏢' },
      { name: 'IMI', color: '#F59E0B', icon: '🏘️' },

      // Utilities
      { name: 'Electricidade', color: '#FBBF24', icon: '⚡' },
      { name: 'Água', color: '#3B82F6', icon: '💧' },
      { name: 'Gás', color: '#EF4444', icon: '🔥' },
      { name: 'Internet/TV', color: '#8B5CF6', icon: '📡' },
      { name: 'Telemóvel', color: '#EC4899', icon: '📱' },

      // Transporte
      { name: 'Combustível', color: '#6366F1', icon: '⛽' },
      { name: 'Transportes Públicos', color: '#14B8A6', icon: '🚇' },
      { name: 'Estacionamento', color: '#10B981', icon: '🅿️' },
      { name: 'Seguro Auto', color: '#059669', icon: '🚗' },
      { name: 'Manutenção Auto', color: '#84CC16', icon: '🔧' },

      // Alimentação
      { name: 'Supermercado', color: '#22C55E', icon: '🛒' },
      { name: 'Restaurantes', color: '#F97316', icon: '🍽️' },
      { name: 'Café/Snacks', color: '#D97706', icon: '☕' },

      // Saúde
      { name: 'Farmácia', color: '#DC2626', icon: '💊' },
      { name: 'Seguro Saúde', color: '#EF4444', icon: '🏥' },
      { name: 'Consultas Médicas', color: '#F87171', icon: '👨‍⚕️' },
      { name: 'Ginásio', color: '#FB923C', icon: '💪' },

      // Educação
      { name: 'Mensalidade Escola', color: '#3B82F6', icon: '🎓' },
      { name: 'Material Escolar', color: '#60A5FA', icon: '📚' },
      { name: 'Explicações', color: '#93C5FD', icon: '✏️' },

      // Seguros
      { name: 'Seguro Habitação', color: '#8B5CF6', icon: '🛡️' },
      { name: 'Seguro Vida', color: '#A78BFA', icon: '❤️' },

      // Entretenimento
      { name: 'Streaming', color: '#EC4899', icon: '📺' },
      { name: 'Cinema/Teatro', color: '#F472B6', icon: '🎬' },
      { name: 'Viagens/Férias', color: '#FB7185', icon: '✈️' },

      // Pessoal
      { name: 'Roupa/Calçado', color: '#06B6D4', icon: '👔' },
      { name: 'Cabeleireiro', color: '#22D3EE', icon: '💇' },
      { name: 'Produtos Higiene', color: '#67E8F9', icon: '🧴' },

      // Casa
      { name: 'Limpeza Casa', color: '#14B8A6', icon: '🧹' },
      { name: 'Reparações Casa', color: '#2DD4BF', icon: '🔨' },
      { name: 'Móveis/Decoração', color: '#5EEAD4', icon: '🛋️' },

      // Financeiro
      { name: 'Empréstimo Habitação', color: '#64748B', icon: '🏦' },
      { name: 'Crédito Pessoal', color: '#94A3B8', icon: '💳' },
      { name: 'Poupança', color: '#CBD5E1', icon: '💰' },

      // Outros
      { name: 'Animais de Estimação', color: '#FB923C', icon: '🐕' },
      { name: 'Presentes', color: '#F472B6', icon: '🎁' },
      { name: 'Outros', color: '#9CA3AF', icon: '📌' },
    ];

    const created = [];
    for (const category of defaultCategories) {
      // Skip if already exists
      const existing = await this.prisma.category.findFirst({
        where: {
          workspaceId,
          name: category.name,
        },
      });

      if (!existing) {
        const newCategory = await this.prisma.category.create({
          data: {
            workspaceId,
            ...category,
          },
        });
        created.push(newCategory);
      }
    }

    return {
      message: `Created ${created.length} default categories`,
      created: created.length,
      total: defaultCategories.length,
      categories: created,
    };
  }
}
