import { Module, forwardRef } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { AccountInstancesModule } from '../account-instances/account-instances.module';

@Module({
  imports: [PrismaModule, forwardRef(() => AccountInstancesModule)],
  controllers: [AccountsController],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
