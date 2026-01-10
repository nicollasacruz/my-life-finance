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
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AccountType, MemberRole } from '@prisma/client';

@ApiTags('Accounts')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller('workspaces/:workspaceId/accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @ApiOperation({ summary: 'Create an account' })
  @UseGuards(RolesGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER)
  @Post()
  create(@Param('workspaceId') workspaceId: string, @Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.create(workspaceId, createAccountDto);
  }

  @ApiOperation({ summary: 'Get all accounts in workspace' })
  @ApiQuery({ name: 'type', enum: AccountType, required: false })
  @Get()
  findAll(@Param('workspaceId') workspaceId: string, @Query('type') type?: AccountType) {
    return this.accountsService.findAll(workspaceId, type);
  }

  @ApiOperation({ summary: 'Get a specific account' })
  @Get(':id')
  findOne(@Param('id') id: string, @Param('workspaceId') workspaceId: string) {
    return this.accountsService.findOne(id, workspaceId);
  }

  @ApiOperation({ summary: 'Update an account' })
  @UseGuards(RolesGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Param('workspaceId') workspaceId: string,
    @Body() updateAccountDto: UpdateAccountDto
  ) {
    return this.accountsService.update(id, workspaceId, updateAccountDto);
  }

  @ApiOperation({ summary: 'Delete an account' })
  @UseGuards(RolesGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @Param('workspaceId') workspaceId: string) {
    return this.accountsService.remove(id, workspaceId);
  }
}
