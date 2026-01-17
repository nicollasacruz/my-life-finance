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
        totalInstallments: dto.totalInstallments,
        principalAmount: dto.principalAmount,
        interestRate: dto.interestRate,
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

    // Automatically generate instances for FIXED, BUDGET and FINANCING accounts
    if ((account.type === AccountType.FIXED || account.type === AccountType.BUDGET || account.type === AccountType.FINANCING) && account.isActive) {
      await this.accountInstancesService.generateInstancesForAccount(account.id);
    }

    return account;
  }

  async findAll(workspaceId: string, type?: AccountType) {
    const accounts = await this.prisma.account.findMany({
      where: {
        workspaceId,
        isActive: true, // Only show active accounts
        ...(type && { type }),
      },
      include: {
        category: true,
        _count: {
          select: {
            instances: true,
          },
        },
        instances: {
          where: {
            status: 'PAID',
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Transform to include paidInstances count
    return accounts.map(account => ({
      ...account,
      _count: {
        instances: account._count.instances,
        paidInstances: account.instances.length,
      },
      instances: undefined, // Remove instances array from response
    }));
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

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Delete only future instances (current month and onwards)
    await this.prisma.accountInstance.deleteMany({
      where: {
        accountId: id,
        OR: [
          { year: { gt: currentYear } },
          {
            year: currentYear,
            month: { gte: currentMonth },
          },
        ],
      },
    });

    // Mark the account as inactive instead of deleting
    // This preserves historical data
    await this.prisma.account.update({
      where: { id },
      data: { isActive: false },
    });

    return { success: true };
  }

  /**
   * Check and finalize financing accounts that have completed all installments or reached endDate
   */
  async finalizeCompletedFinancings() {
    const now = new Date();

    // Find active financing accounts that have reached their end date
    const accountsToFinalize = await this.prisma.account.findMany({
      where: {
        type: AccountType.FINANCING,
        isActive: true,
        OR: [
          // End date has been reached
          {
            endDate: {
              lte: now,
            },
          },
        ],
      },
      include: {
        instances: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    const finalizedIds: string[] = [];

    for (const account of accountsToFinalize) {
      let shouldFinalize = false;

      // Check if end date has been reached
      if (account.endDate && account.endDate <= now) {
        shouldFinalize = true;
      }

      // Check if all installments are paid (if totalInstallments is set)
      if (account.totalInstallments) {
        const paidInstances = account.instances.filter((i) => i.status === 'PAID');
        if (paidInstances.length >= account.totalInstallments) {
          shouldFinalize = true;
        }
      }

      if (shouldFinalize) {
        await this.prisma.account.update({
          where: { id: account.id },
          data: { isActive: false },
        });
        finalizedIds.push(account.id);
      }
    }

    return {
      count: finalizedIds.length,
      accountIds: finalizedIds,
    };
  }
}
