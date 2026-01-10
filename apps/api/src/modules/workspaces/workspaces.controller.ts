import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { MemberRole } from '@prisma/client';

@ApiTags('Workspaces')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @ApiOperation({ summary: 'Create a new workspace' })
  @Post()
  create(@Req() req: any, @Body() createWorkspaceDto: CreateWorkspaceDto) {
    return this.workspacesService.create(req.user.userId, createWorkspaceDto);
  }

  @ApiOperation({ summary: 'Get all workspaces for current user' })
  @Get()
  findAll(@Req() req: any) {
    return this.workspacesService.findAll(req.user.userId);
  }

  @ApiOperation({ summary: 'Get a specific workspace' })
  @UseGuards(WorkspaceGuard)
  @Get(':workspaceId')
  findOne(@Param('workspaceId') workspaceId: string, @Req() req: any) {
    return this.workspacesService.findOne(workspaceId, req.user.userId);
  }

  @ApiOperation({ summary: 'Update a workspace' })
  @UseGuards(WorkspaceGuard, RolesGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  @Patch(':workspaceId')
  update(@Param('workspaceId') workspaceId: string, @Body() updateWorkspaceDto: UpdateWorkspaceDto) {
    return this.workspacesService.update(workspaceId, updateWorkspaceDto);
  }

  @ApiOperation({ summary: 'Delete a workspace' })
  @UseGuards(WorkspaceGuard, RolesGuard)
  @Roles(MemberRole.OWNER)
  @Delete(':workspaceId')
  remove(@Param('workspaceId') workspaceId: string) {
    return this.workspacesService.remove(workspaceId);
  }
}
