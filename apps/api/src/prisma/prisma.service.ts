import { INestApplication, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'beforeExit'>
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly configService: ConfigService) {
    const databaseUrl = configService.get<string>('DATABASE_URL');
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not set');
    }

    super({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
      log:
        configService.get<string>('NODE_ENV') === 'development'
          ? ['info', 'warn', 'error']
          : ['warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async enableShutdownHooks(app: INestApplication) {
    const shutdown = async () => {
      await app.close();
      await this.$disconnect();
    };

    process.once('beforeExit', shutdown);
    ['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) => {
      process.once(signal, shutdown);
    });
  }
}
