import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InvitesService } from './invites.service';
import { InviteMemberDto } from './dto/invite-member.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { MemberRole } from '@prisma/client';

@ApiTags('Workspace Invites')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller()
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @ApiOperation({ summary: 'Invite a member to workspace' })
  @UseGuards(WorkspaceGuard, RolesGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  @Post('workspaces/:workspaceId/invites')
  create(
    @Param('workspaceId') workspaceId: string,
    @Body() inviteMemberDto: InviteMemberDto,
    @Req() req: any,
  ) {
    return this.invitesService.create(workspaceId, req.user.userId, inviteMemberDto);
  }

  @ApiOperation({ summary: 'Get all invites for a workspace' })
  @UseGuards(WorkspaceGuard, RolesGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  @Get('workspaces/:workspaceId/invites')
  findAll(@Param('workspaceId') workspaceId: string) {
    return this.invitesService.findAll(workspaceId);
  }

  @ApiOperation({ summary: 'Accept an invite' })
  @Post('invites/:token/accept')
  accept(@Param('token') token: string, @Req() req: any) {
    return this.invitesService.accept(token, req.user.userId);
  }

  @ApiOperation({ summary: 'Decline an invite' })
  @Post('invites/:token/decline')
  decline(@Param('token') token: string, @Req() req: any) {
    return this.invitesService.decline(token, req.user.userId);
  }

  @ApiOperation({ summary: 'Cancel an invite' })
  @UseGuards(WorkspaceGuard, RolesGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  @Delete('workspaces/:workspaceId/invites/:inviteId')
  cancel(@Param('inviteId') inviteId: string) {
    return this.invitesService.cancel(inviteId);
  }
}
