import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(workspaceId: string, dto: CreateTransactionDto) {
    // Verify the account instance exists and belongs to a BUDGET account in this workspace
    const instance = await this.prisma.accountInstance.findFirst({
      where: {
        id: dto.accountInstanceId,
        account: {
          workspaceId,
          type: 'BUDGET',
        },
      },
      include: {
        account: true,
      },
    });

    if (!instance) {
      throw new NotFoundException('Account instance not found or not a BUDGET account');
    }

    const transaction = await this.prisma.transaction.create({
      data: {
        accountInstanceId: dto.accountInstanceId,
        amount: dto.amount,
        description: dto.description,
        date: new Date(dto.date),
        location: dto.location,
        attachmentUrl: dto.attachmentUrl,
      },
      include: {
        accountInstance: {
          include: {
            account: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    return transaction;
  }

  async findAll(
    workspaceId: string,
    accountId?: string,
    year?: number,
    month?: number,
  ) {
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month || now.getMonth() + 1;

    const transactions = await this.prisma.transaction.findMany({
      where: {
        accountInstance: {
          account: {
            workspaceId,
            ...(accountId && { id: accountId }),
          },
          year: targetYear,
          month: targetMonth,
        },
      },
      include: {
        accountInstance: {
          include: {
            account: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return transactions;
  }

  async findOne(id: string, workspaceId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id,
        accountInstance: {
          account: {
            workspaceId,
          },
        },
      },
      include: {
        accountInstance: {
          include: {
            account: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async update(id: string, workspaceId: string, dto: UpdateTransactionDto) {
    await this.findOne(id, workspaceId);

    const updateData: any = {};

    if (dto.amount !== undefined) {
      updateData.amount = dto.amount;
    }

    if (dto.description !== undefined) {
      updateData.description = dto.description;
    }

    if (dto.date) {
      updateData.date = new Date(dto.date);
    }

    if (dto.location !== undefined) {
      updateData.location = dto.location;
    }

    if (dto.attachmentUrl !== undefined) {
      updateData.attachmentUrl = dto.attachmentUrl;
    }

    return this.prisma.transaction.update({
      where: { id },
      data: updateData,
      include: {
        accountInstance: {
          include: {
            account: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: string, workspaceId: string) {
    await this.findOne(id, workspaceId);

    await this.prisma.transaction.delete({
      where: { id },
    });

    return { success: true };
  }

  async getMonthlyTotal(accountInstanceId: string) {
    const total = await this.prisma.transaction.aggregate({
      where: {
        accountInstanceId,
      },
      _sum: {
        amount: true,
      },
    });

    return Number(total._sum.amount || 0);
  }
}
