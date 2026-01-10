import { Module } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { MembersService } from './members.service';
import { InvitesService } from './invites.service';
import { WorkspacesController } from './workspaces.controller';
import { MembersController } from './members.controller';
import { InvitesController } from './invites.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WorkspacesController, MembersController, InvitesController],
  providers: [WorkspacesService, MembersService, InvitesService],
  exports: [WorkspacesService, MembersService, InvitesService],
})
export class WorkspacesModule {}
