import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('workspaces/:workspaceId/dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOperation({ summary: 'Get monthly overview' })
  @Get('monthly')
  getMonthlyOverview(
    @Param('workspaceId') workspaceId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.dashboardService.getMonthlyOverview(
      workspaceId,
      parseInt(year),
      parseInt(month),
    );
  }

  @ApiOperation({ summary: 'Get yearly overview' })
  @Get('yearly')
  getYearlyOverview(
    @Param('workspaceId') workspaceId: string,
    @Query('year') year: string,
  ) {
    return this.dashboardService.getYearlyOverview(workspaceId, parseInt(year));
  }
}
