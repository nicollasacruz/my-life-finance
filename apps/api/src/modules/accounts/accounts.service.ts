import { Injectable, NotFoundException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountType } from '@prisma/client';
import { AccountInstancesService } from '../account-instances/account-instances.service';

@Injectable()
export class AccountsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => AccountInstancesService))
    private accountInstancesService: AccountInstancesService,
  ) {}

  async create(workspaceId: string, dto: CreateAccountDto) {
    const existing = await this.prisma.account.findFirst({
      where: { workspaceId, name: dto.name },
    });

    if (existing) {
      throw new ConflictException('Account name already exists in this workspace');
    }

    const account = await this.prisma.account.create({
      data: {
        workspaceId,
        name: dto.name,
        description: dto.description,
        type: dto.type,
        categoryId: dto.categoryId,
        color: dto.color,
        icon: dto.icon,
        isAmountFixed: dto.type === AccountType.FIXED ? (dto.isAmountFixed ?? true) : true,
        fixedAmount: dto.fixedAmount,
        dueDay: dto.dueDay,
        recurrence: dto.recurrence || 'MONTHLY',
        budgetAmount: dto.budgetAmount,
        alertDaysBefore: dto.alertDaysBefore ?? 3,
        alertBudgetPercent: dto.alertBudgetPercent ?? 80,
        isActive: dto.isActive ?? true,
        startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
      include: {
        category: true,
      },
    });

    // Automatically generate instances for FIXED accounts for the entire year
    if (account.type === AccountType.FIXED && account.isActive) {
      await this.accountInstancesService.generateInstancesForAccount(account.id);
    }

    return account;
  }

  async findAll(workspaceId: string, type?: AccountType) {
    return this.prisma.account.findMany({
      where: {
        workspaceId,
        ...(type && { type }),
      },
      include: {
        category: true,
        _count: {
          select: {
            instances: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string, workspaceId: string) {
    const account = await this.prisma.account.findFirst({
      where: { id, workspaceId },
      include: {
        category: true,
        instances: {
          orderBy: [{ year: 'desc' }, { month: 'desc' }],
          take: 12,
        },
      },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }

  async update(id: string, workspaceId: string, dto: UpdateAccountDto) {
    const account = await this.prisma.account.findFirst({
      where: { id, workspaceId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (dto.name && dto.name !== account.name) {
      const existing = await this.prisma.account.findFirst({
        where: {
          workspaceId,
          name: dto.name,
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException('Account name already exists');
      }
    }

    return this.prisma.account.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
        ...(dto.color && { color: dto.color }),
        ...(dto.icon && { icon: dto.icon }),
        ...(dto.isAmountFixed !== undefined && { isAmountFixed: dto.isAmountFixed }),
        ...(dto.fixedAmount !== undefined && { fixedAmount: dto.fixedAmount }),
        ...(dto.dueDay !== undefined && { dueDay: dto.dueDay }),
        ...(dto.recurrence && { recurrence: dto.recurrence }),
        ...(dto.budgetAmount !== undefined && { budgetAmount: dto.budgetAmount }),
        ...(dto.alertDaysBefore !== undefined && { alertDaysBefore: dto.alertDaysBefore }),
        ...(dto.alertBudgetPercent !== undefined && { alertBudgetPercent: dto.alertBudgetPercent }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.startDate && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate !== undefined && { endDate: dto.endDate ? new Date(dto.endDate) : null }),
      },
      include: {
        category: true,
      },
    });
  }

  async remove(id: string, workspaceId: string) {
    const account = await this.prisma.account.findFirst({
      where: { id, workspaceId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    await this.prisma.account.delete({
      where: { id },
    });

    return { success: true };
  }
}
