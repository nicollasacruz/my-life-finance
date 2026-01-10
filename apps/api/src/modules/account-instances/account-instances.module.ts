import { Module, forwardRef } from '@nestjs/common';
import { AccountInstancesService } from './account-instances.service';
import { AccountInstancesController } from './account-instances.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AccountInstancesController],
  providers: [AccountInstancesService],
  exports: [AccountInstancesService],
})
export class AccountInstancesModule {}
