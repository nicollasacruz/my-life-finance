import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AccountInstancesService } from './account-instances.service';
import { MarkPaidDto } from './dto/mark-paid.dto';
import { UpdateInstanceDto } from './dto/update-instance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { MemberRole } from '@prisma/client';

@ApiTags('Account Instances')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller('workspaces/:workspaceId/account-instances')
export class AccountInstancesController {
  constructor(private readonly accountInstancesService: AccountInstancesService) {}

  @ApiOperation({ summary: 'Get all instances for a month' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @Get()
  findAll(
    @Param('workspaceId') workspaceId: string,
    @Query('year') year?: number,
    @Query('month') month?: number,
  ) {
    return this.accountInstancesService.findAll(workspaceId, year, month);
  }

  @ApiOperation({ summary: 'Get dashboard stats for a month' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @Get('stats')
  getDashboardStats(
    @Param('workspaceId') workspaceId: string,
    @Query('year') year?: number,
    @Query('month') month?: number,
  ) {
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month || now.getMonth() + 1;
    return this.accountInstancesService.getDashboardStats(workspaceId, targetYear, targetMonth);
  }

  @ApiOperation({ summary: 'Generate instances for the entire year (manual trigger)' })
  @UseGuards(RolesGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  @Post('generate')
  generateYearly(
    @Param('workspaceId') workspaceId: string,
    @Query('year') year?: number,
  ) {
    return this.accountInstancesService.generateYearlyInstances(workspaceId, year);
  }

  @ApiOperation({ summary: 'Get a specific instance' })
  @Get(':id')
  findOne(@Param('id') id: string, @Param('workspaceId') workspaceId: string) {
    return this.accountInstancesService.findOne(id, workspaceId);
  }

  @ApiOperation({ summary: 'Mark instance as PAID' })
  @UseGuards(RolesGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER)
  @Post(':id/mark-paid')
  markPaid(
    @Param('id') id: string,
    @Param('workspaceId') workspaceId: string,
    @Body() markPaidDto: MarkPaidDto,
  ) {
    return this.accountInstancesService.markPaid(id, workspaceId, markPaidDto);
  }

  @ApiOperation({ summary: 'Mark instance as EXEMPT' })
  @UseGuards(RolesGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER)
  @Post(':id/mark-exempt')
  markExempt(@Param('id') id: string, @Param('workspaceId') workspaceId: string) {
    return this.accountInstancesService.markExempt(id, workspaceId);
  }

  @ApiOperation({ summary: 'Reopen instance (PAID/EXEMPT -> OPEN)' })
  @UseGuards(RolesGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER)
  @Post(':id/reopen')
  reopen(@Param('id') id: string, @Param('workspaceId') workspaceId: string) {
    return this.accountInstancesService.reopen(id, workspaceId);
  }

  @ApiOperation({ summary: 'Update instance details' })
  @UseGuards(RolesGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Param('workspaceId') workspaceId: string,
    @Body() updateInstanceDto: UpdateInstanceDto,
  ) {
    return this.accountInstancesService.update(id, workspaceId, updateInstanceDto);
  }

  @ApiOperation({ summary: 'Delete an instance' })
  @UseGuards(RolesGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @Param('workspaceId') workspaceId: string) {
    return this.accountInstancesService.remove(id, workspaceId);
  }
}
