import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    email: string;
    passwordHash: string;
    name: string;
  }): Promise<User> {
    const email = data.email.toLowerCase();
    return this.prisma.user.create({
      data: {
        email,
        passwordHash: data.passwordHash,
        name: data.name,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async addPushSubscription(userId: string, input: { endpoint: string; p256dh: string; auth: string }) {
    return this.prisma.pushSubscription.upsert({
      where: { endpoint: input.endpoint },
      update: {
        p256dh: input.p256dh,
        auth: input.auth,
        userId,
      },
      create: {
        endpoint: input.endpoint,
        p256dh: input.p256dh,
        auth: input.auth,
        userId,
      },
    });
  }

  async removePushSubscription(userId: string, endpoint: string) {
    const existing = await this.prisma.pushSubscription.findUnique({ where: { endpoint } });
    if (!existing || existing.userId !== userId) {
      return null;
    }
    return this.prisma.pushSubscription.delete({
      where: { endpoint },
    });
  }
}
