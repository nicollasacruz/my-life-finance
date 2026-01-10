import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MembersService } from './members.service';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { MemberRole } from '@prisma/client';

@ApiTags('Workspace Members')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller('workspaces/:workspaceId/members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @ApiOperation({ summary: 'Get all members of a workspace' })
  @Get()
  findAll(@Param('workspaceId') workspaceId: string) {
    return this.membersService.findAll(workspaceId);
  }

  @ApiOperation({ summary: 'Update member role' })
  @UseGuards(RolesGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  @Patch(':userId/role')
  updateRole(
    @Param('workspaceId') workspaceId: string,
    @Param('userId') userId: string,
    @Body() updateMemberRoleDto: UpdateMemberRoleDto,
    @Req() req: any,
  ) {
    return this.membersService.updateRole(
      workspaceId,
      userId,
      updateMemberRoleDto,
      req.workspaceMember.role,
    );
  }

  @ApiOperation({ summary: 'Remove member from workspace' })
  @UseGuards(RolesGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  @Delete(':userId')
  remove(
    @Param('workspaceId') workspaceId: string,
    @Param('userId') userId: string,
    @Req() req: any,
  ) {
    return this.membersService.remove(workspaceId, userId, req.user.userId);
  }
}
