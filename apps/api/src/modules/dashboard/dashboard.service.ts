import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AccountType } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getMonthlyOverview(workspaceId: string, year: number, month: number) {
    // Get all accounts with their budget data
    const accounts = await this.prisma.account.findMany({
      where: { workspaceId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
      },
    });

    // Get instances for accounts (both FIXED and BUDGET)
    const instances = await this.prisma.accountInstance.findMany({
      where: {
        account: { workspaceId },
        year,
        month,
      },
      include: {
        account: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                color: true,
                icon: true,
              },
            },
          },
        },
        transactions: true,
      },
    });

    const fixedAccounts = accounts.filter((a) => a.type === AccountType.FIXED);
    const budgetAccounts = accounts.filter((a) => a.type === AccountType.BUDGET);
    const financingAccounts = accounts.filter((a) => a.type === 'FINANCING');
    const oneTimeAccounts = accounts.filter((a) => a.type === 'ONE_TIME');

    // Calculate totals for FIXED accounts
    const fixedInstances = instances.filter((i) => i.account.type === AccountType.FIXED);
    const fixedTotal = fixedInstances.reduce((sum, inst) => {
      if (inst.status === 'PAID') {
        return sum + Number(inst.paidAmount || 0);
      } else if (inst.status === 'OPEN') {
        return sum + Number(inst.amount || 0);
      }
      return sum;
    }, 0);

    const fixedPaid = fixedInstances
      .filter((i) => i.status === 'PAID')
      .reduce((sum, i) => sum + Number(i.paidAmount || 0), 0);

    const fixedPending = fixedInstances
      .filter((i) => i.status === 'OPEN')
      .reduce((sum, i) => sum + Number(i.amount || 0), 0);

    // Calculate totals for BUDGET accounts from transactions
    const budgetInstances = instances.filter((i) => i.account.type === AccountType.BUDGET);
    const budgetTotal = budgetInstances.reduce((sum, inst) => sum + Number(inst.budgetAmount || 0), 0);

    const allTransactions = budgetInstances.flatMap((i) => i.transactions);
    const budgetSpent = allTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

    // Category breakdown for BUDGET accounts
    const categorySpending: Record<string, { name: string; spent: number; budget: number; color?: string; icon?: string }> = {};

    budgetAccounts.forEach((account) => {
      if (account.category) {
        const categoryId = account.category.id;
        if (!categorySpending[categoryId]) {
          categorySpending[categoryId] = {
            name: account.category.name,
            spent: 0,
            budget: 0,
            color: account.category.color,
            icon: account.category.icon || undefined,
          };
        }
        categorySpending[categoryId].budget += Number(account.budgetAmount || 0);
      }
    });

    budgetInstances.forEach((instance) => {
      if (instance.account.category) {
        const categoryId = instance.account.category.id;
        if (categorySpending[categoryId]) {
          const instanceSpent = instance.transactions.reduce((sum, t) => sum + Number(t.amount), 0);
          categorySpending[categoryId].spent += instanceSpent;
        }
      }
    });

    // Recent transactions
    const recentTransactions = allTransactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    // Calculate totals for FINANCING accounts
    const financingInstances = instances.filter((i) => i.account.type === 'FINANCING');
    const financingTotal = financingInstances.reduce((sum, inst) => {
      if (inst.status === 'PAID') {
        return sum + Number(inst.paidAmount || 0);
      } else if (inst.status === 'OPEN') {
        return sum + Number(inst.amount || 0);
      }
      return sum;
    }, 0);

    const financingPaid = financingInstances
      .filter((i) => i.status === 'PAID')
      .reduce((sum, i) => sum + Number(i.paidAmount || 0), 0);

    const financingPending = financingInstances
      .filter((i) => i.status === 'OPEN')
      .reduce((sum, i) => sum + Number(i.amount || 0), 0);

    // Calculate totals for ONE_TIME accounts
    const oneTimeInstances = instances.filter((i) => i.account.type === 'ONE_TIME');
    const oneTimeTotal = oneTimeInstances.reduce((sum, inst) => {
      if (inst.status === 'PAID') {
        return sum + Number(inst.paidAmount || 0);
      } else if (inst.status === 'OPEN') {
        return sum + Number(inst.amount || 0);
      }
      return sum;
    }, 0);

    const oneTimePaid = oneTimeInstances
      .filter((i) => i.status === 'PAID')
      .reduce((sum, i) => sum + Number(i.paidAmount || 0), 0);

    const oneTimePending = oneTimeInstances
      .filter((i) => i.status === 'OPEN')
      .reduce((sum, i) => sum + Number(i.amount || 0), 0);

    // Calculate monthly total: FIXED + max(BUDGET instance, BUDGET transactions) + FINANCING + ONE_TIME
    const budgetForTotal = Math.max(budgetTotal, budgetSpent);
    const monthlyTotal = fixedTotal + budgetForTotal + financingTotal + oneTimeTotal;

    // Upcoming instances
    const upcomingInstances = instances
      .filter((i) => i.status === 'OPEN')
      .sort((a, b) => {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        return dateA - dateB;
      })
      .slice(0, 10);

    return {
      month,
      year,
      fixed: {
        total: fixedTotal,
        paid: fixedPaid,
        pending: fixedPending,
        count: fixedAccounts.length,
      },
      budget: {
        total: budgetTotal,
        spent: budgetSpent,
        remaining: budgetTotal - budgetSpent,
        percentage: budgetTotal > 0 ? (budgetSpent / budgetTotal) * 100 : 0,
        count: budgetAccounts.length,
      },
      financing: {
        total: financingTotal,
        paid: financingPaid,
        pending: financingPending,
        count: financingAccounts.length,
      },
      oneTime: {
        total: oneTimeTotal,
        paid: oneTimePaid,
        pending: oneTimePending,
        count: oneTimeAccounts.length,
      },
      monthlyTotal,
      categoryBreakdown: Object.values(categorySpending),
      recentTransactions: recentTransactions.map((t) => ({
        id: t.id,
        description: t.description,
        amount: Number(t.amount),
        date: t.date,
      })),
      upcomingInstances: upcomingInstances.map((i) => ({
        id: i.id,
        dueDate: i.dueDate,
        amount: Number(i.amount || 0),
        isOverdue: i.dueDate ? new Date(i.dueDate) < new Date() : false,
        account: {
          id: i.account.id,
          name: i.account.name,
          icon: i.account.icon,
          color: i.account.color,
          category: i.account.category,
        },
      })),
    };
  }

  async getCategoryReport(workspaceId: string, year: number) {
    // Pull all BUDGET instances for the given year with transactions
    const instances = await this.prisma.accountInstance.findMany({
      where: {
        account: {
          workspaceId,
          type: AccountType.BUDGET,
        },
        year,
      },
      include: {
        account: {
          include: {
            category: {
              select: { id: true, name: true, color: true, icon: true },
            },
          },
        },
        transactions: true,
      },
    });

    const breakdown: Record<
      string,
      { name: string; color?: string; icon?: string; budgetTotal: number; spent: number }
    > = {};

    instances.forEach((inst) => {
      if (!inst.account.category) return;
      const id = inst.account.category.id;
      if (!breakdown[id]) {
        breakdown[id] = {
          name: inst.account.category.name,
          color: inst.account.category.color,
          icon: inst.account.category.icon || undefined,
          budgetTotal: 0,
          spent: 0,
        };
      }
      breakdown[id].budgetTotal += Number(inst.budgetAmount || 0);
      breakdown[id].spent += inst.transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    });

    return {
      year,
      categories: Object.entries(breakdown).map(([id, data]) => ({
        id,
        ...data,
        percentage: data.budgetTotal > 0 ? (data.spent / data.budgetTotal) * 100 : 0,
      })),
    };
  }

  async getYearlyOverview(workspaceId: string, year: number) {
    const monthlyData: Array<{
      month: number;
      fixedTotal: number;
      budgetTotal: number;
      budgetSpent: number;
      total: number;
    }> = [];

    for (let month = 1; month <= 12; month++) {
      const data = await this.getMonthlyOverview(workspaceId, year, month);
      monthlyData.push({
        month,
        fixedTotal: data.fixed.total,
        budgetTotal: data.budget.total,
        budgetSpent: data.budget.spent,
        total: data.fixed.total + data.budget.spent,
      });
    }

    return {
      year,
      monthlyData,
      yearTotal: monthlyData.reduce((sum, m) => sum + m.total, 0),
    };
  }
}
