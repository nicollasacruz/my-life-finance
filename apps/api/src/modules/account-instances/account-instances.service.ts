import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MarkPaidDto } from './dto/mark-paid.dto';
import { UpdateInstanceDto } from './dto/update-instance.dto';
import { FixedAccountStatus, AccountType } from '@prisma/client';

@Injectable()
export class AccountInstancesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate instances for the entire year for all FIXED accounts
   * Called when account is created or manually triggered
   */
  async generateYearlyInstances(workspaceId: string, year?: number) {
    const targetYear = year || new Date().getFullYear();
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 1-12

    const fixedAccounts = await this.prisma.account.findMany({
      where: {
        workspaceId,
        type: AccountType.FIXED,
        isActive: true,
      },
    });

    const instances = [];

    for (const account of fixedAccounts) {
      // Determine start month (either account startDate or current month)
      let startMonth = currentMonth;
      if (account.startDate) {
        const startDate = new Date(account.startDate);
        if (startDate.getFullYear() === targetYear) {
          startMonth = Math.max(startDate.getMonth() + 1, currentMonth);
        } else if (startDate.getFullYear() > targetYear) {
          continue; // Account hasn't started yet
        }
      }

      // Determine end month (either account endDate or December)
      let endMonth = 12;
      if (account.endDate) {
        const endDate = new Date(account.endDate);
        if (endDate.getFullYear() === targetYear) {
          endMonth = endDate.getMonth() + 1;
        } else if (endDate.getFullYear() < targetYear) {
          continue; // Account already ended
        }
      }

      // Generate instance for each month from start to end
      for (let month = startMonth; month <= endMonth; month++) {
        // Check if instance already exists
        const existing = await this.prisma.accountInstance.findFirst({
          where: {
            accountId: account.id,
            year: targetYear,
            month,
          },
        });

        if (existing) continue;

        // Calculate due date based on dueDay
        const dueDay = Math.min(account.dueDay || 1, this.getDaysInMonth(targetYear, month));
        const dueDate = new Date(targetYear, month - 1, dueDay);

        const instance = await this.prisma.accountInstance.create({
          data: {
            accountId: account.id,
            year: targetYear,
            month,
            dueDate,
            amount: account.isAmountFixed ? account.fixedAmount : null,
            status: FixedAccountStatus.OPEN,
          },
          include: {
            account: {
              include: {
                category: true,
              },
            },
          },
        });

        instances.push(instance);
      }
    }

    return instances;
  }

  /**
   * Generate instances for a single account (called after account creation)
   * Supports FIXED, BUDGET and FINANCING account types
   */
  async generateInstancesForAccount(accountId: string) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      include: { workspace: true },
    });

    const supportedTypes = [AccountType.FIXED, AccountType.BUDGET, AccountType.FINANCING];
    if (!account || !supportedTypes.includes(account.type) || !account.isActive) {
      return [];
    }

    const today = new Date();
    const instances = [];

    if (account.type === AccountType.FINANCING) {
      // For FINANCING accounts, generate based on totalInstallments
      const totalInstallments = account.totalInstallments || 12;
      const startDate = account.startDate ? new Date(account.startDate) : today;

      for (let i = 0; i < totalInstallments; i++) {
        const installmentDate = new Date(startDate);
        installmentDate.setMonth(startDate.getMonth() + i);

        const year = installmentDate.getFullYear();
        const month = installmentDate.getMonth() + 1;

        // Skip if in the past
        if (installmentDate < today) continue;

        // Check if instance already exists
        const existing = await this.prisma.accountInstance.findFirst({
          where: {
            accountId: account.id,
            year,
            month,
          },
        });

        if (existing) continue;

        const dueDay = Math.min(account.dueDay || 1, this.getDaysInMonth(year, month));
        const dueDate = new Date(year, month - 1, dueDay);

        const instance = await this.prisma.accountInstance.create({
          data: {
            accountId: account.id,
            year,
            month,
            dueDate,
            amount: account.fixedAmount,
            status: FixedAccountStatus.OPEN,
          },
          include: {
            account: {
              include: {
                category: true,
              },
            },
          },
        });

        instances.push(instance);
      }
    } else {
      // For FIXED and BUDGET accounts, generate from current month to end of year
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + 1;

      // Determine start month (current month or startDate, whichever is later)
      let startMonth = currentMonth;
      if (account.startDate) {
        const startDate = new Date(account.startDate);
        if (startDate.getFullYear() === currentYear) {
          startMonth = Math.max(startDate.getMonth() + 1, currentMonth);
        } else if (startDate.getFullYear() > currentYear) {
          return []; // Account hasn't started yet
        }
      }

      // Determine end month
      let endMonth = 12;
      if (account.endDate) {
        const endDate = new Date(account.endDate);
        if (endDate.getFullYear() === currentYear) {
          endMonth = endDate.getMonth() + 1;
        } else if (endDate.getFullYear() < currentYear) {
          return []; // Account already ended
        }
      }

      // Generate instances for remaining months of the year
      for (let month = startMonth; month <= endMonth; month++) {
        // Check if instance already exists
        const existing = await this.prisma.accountInstance.findFirst({
          where: {
            accountId: account.id,
            year: currentYear,
            month,
          },
        });

        if (existing) continue;

        const instanceData =
          account.type === AccountType.BUDGET
            ? {
                accountId: account.id,
                year: currentYear,
                month,
                budgetAmount: account.budgetAmount,
                status: FixedAccountStatus.OPEN,
              }
            : {
                accountId: account.id,
                year: currentYear,
                month,
                dueDate: new Date(
                  currentYear,
                  month - 1,
                  Math.min(account.dueDay || 1, this.getDaysInMonth(currentYear, month)),
                ),
                amount: account.isAmountFixed ? account.fixedAmount : null,
                status: FixedAccountStatus.OPEN,
              };

        instances.push(
          await this.prisma.accountInstance.create({
            data: instanceData,
            include: {
              account: {
                include: {
                  category: true,
                },
              },
            },
          }),
        );
      }
    }

    return instances;
  }

  /**
   * Find all instances for a workspace in a given month
   */
  async findAll(workspaceId: string, year?: number, month?: number) {
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month || now.getMonth() + 1;

    // Ensure BUDGET accounts have instances for the requested month
    await this.ensureBudgetInstancesForMonth(workspaceId, targetYear, targetMonth);

    const instances = await this.prisma.accountInstance.findMany({
      where: {
        account: {
          workspaceId,
        },
        year: targetYear,
        month: targetMonth,
      },
      include: {
        account: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    // Calculate OVERDUE status dynamically
    return instances.map((instance) => ({
      ...instance,
      isOverdue:
        instance.status === FixedAccountStatus.OPEN &&
        instance.dueDate !== null &&
        instance.dueDate < new Date(),
    }));
  }

  /**
   * Find a specific instance
   */
  async findOne(id: string, workspaceId: string) {
    const instance = await this.prisma.accountInstance.findFirst({
      where: {
        id,
        account: {
          workspaceId,
        },
      },
      include: {
        account: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!instance) {
      throw new NotFoundException('Instance not found');
    }

    return {
      ...instance,
      isOverdue:
        instance.status === FixedAccountStatus.OPEN &&
        instance.dueDate !== null &&
        instance.dueDate < new Date(),
    };
  }

  /**
   * Mark an instance as PAID
   */
  async markPaid(id: string, workspaceId: string, dto: MarkPaidDto) {
    const instance = await this.findOne(id, workspaceId);

    if (instance.status === FixedAccountStatus.PAID) {
      throw new BadRequestException('Instance is already marked as paid');
    }

    if (instance.status === FixedAccountStatus.EXEMPT) {
      throw new BadRequestException('Cannot mark exempt instance as paid');
    }

    const paidAmount = dto.confirmedAmount || instance.amount;
    const paidAt = dto.paidAt ? new Date(dto.paidAt) : new Date();

    return this.prisma.accountInstance.update({
      where: { id },
      data: {
        status: FixedAccountStatus.PAID,
        paidAmount,
        paidAt,
      },
      include: {
        account: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  /**
   * Mark an instance as EXEMPT (skipped payment)
   */
  async markExempt(id: string, workspaceId: string) {
    const instance = await this.findOne(id, workspaceId);

    if (instance.status === FixedAccountStatus.PAID) {
      throw new BadRequestException('Cannot exempt a paid instance');
    }

    return this.prisma.accountInstance.update({
      where: { id },
      data: {
        status: FixedAccountStatus.EXEMPT,
        paidAt: null,
        paidAmount: null,
      },
      include: {
        account: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  /**
   * Reopen an instance (from PAID or EXEMPT back to OPEN)
   */
  async reopen(id: string, workspaceId: string) {
    const instance = await this.findOne(id, workspaceId);

    if (instance.status === FixedAccountStatus.OPEN) {
      throw new BadRequestException('Instance is already open');
    }

    return this.prisma.accountInstance.update({
      where: { id },
      data: {
        status: FixedAccountStatus.OPEN,
        paidAt: null,
        paidAmount: null,
      },
      include: {
        account: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  /**
   * Update instance details (estimated amount, due date, notes)
   */
  async update(id: string, workspaceId: string, dto: UpdateInstanceDto) {
    await this.findOne(id, workspaceId);

    const updateData: any = {};

    if (dto.estimatedAmount !== undefined) {
      updateData.amount = dto.estimatedAmount;
    }

    if (dto.dueDate) {
      updateData.dueDate = new Date(dto.dueDate);
    }

    if (dto.notes !== undefined) {
      updateData.notes = dto.notes;
    }

    return this.prisma.accountInstance.update({
      where: { id },
      data: updateData,
      include: {
        account: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  /**
   * Delete an instance
   */
  async remove(id: string, workspaceId: string) {
    await this.findOne(id, workspaceId);

    await this.prisma.accountInstance.delete({
      where: { id },
    });

    return { success: true };
  }

  /**
   * Ensure all active BUDGET accounts have an instance for the given month
   */
  private async ensureBudgetInstancesForMonth(workspaceId: string, year: number, month: number) {
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);

    const accountsNeedingInstance = await this.prisma.account.findMany({
      where: {
        workspaceId,
        type: AccountType.BUDGET,
        isActive: true,
        startDate: { lte: monthEnd },
        OR: [{ endDate: null }, { endDate: { gte: monthStart } }],
        instances: {
          none: {
            year,
            month,
          },
        },
      },
    });

    if (!accountsNeedingInstance.length) return;

    await this.prisma.$transaction(
      accountsNeedingInstance.map((account) =>
        this.prisma.accountInstance.upsert({
          where: {
            accountId_year_month: {
              accountId: account.id,
              year,
              month,
            },
          },
          update: {},
          create: {
            accountId: account.id,
            year,
            month,
            budgetAmount: account.budgetAmount,
            status: FixedAccountStatus.OPEN,
          },
        }),
      ),
    );
  }

  /**
   * Get dashboard stats for a month
   */
  async getDashboardStats(workspaceId: string, year: number, month: number) {
    const instances = await this.findAll(workspaceId, year, month);

    const stats = {
      total: instances.length,
      paid: instances.filter((i) => i.status === FixedAccountStatus.PAID).length,
      open: instances.filter((i) => i.status === FixedAccountStatus.OPEN).length,
      overdue: instances.filter((i) => i.isOverdue).length,
      exempt: instances.filter((i) => i.status === FixedAccountStatus.EXEMPT).length,
      totalAmount: instances.reduce((sum, i) => sum + Number(i.amount || 0), 0),
      paidAmount: instances
        .filter((i) => i.status === FixedAccountStatus.PAID)
        .reduce((sum, i) => sum + Number(i.paidAmount || 0), 0),
      pendingAmount: instances
        .filter((i) => i.status === FixedAccountStatus.OPEN)
        .reduce((sum, i) => sum + Number(i.amount || 0), 0),
    };

    return stats;
  }

  /**
   * Helper: Get days in month
   */
  private getDaysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  }
}
