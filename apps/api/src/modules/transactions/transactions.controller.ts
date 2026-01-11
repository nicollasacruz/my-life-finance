import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('transactions')
@ApiBearerAuth()
@Controller('workspaces/:workspaceId/transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @ApiOperation({ summary: 'Create a new transaction' })
  @Post()
  create(
    @Param('workspaceId') workspaceId: string,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    return this.transactionsService.create(workspaceId, createTransactionDto);
  }

  @ApiOperation({ summary: 'Get all transactions for a workspace' })
  @Get()
  findAll(
    @Param('workspaceId') workspaceId: string,
    @Query('accountId') accountId?: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    return this.transactionsService.findAll(
      workspaceId,
      accountId,
      year ? parseInt(year) : undefined,
      month ? parseInt(month) : undefined,
    );
  }

  @ApiOperation({ summary: 'Get a single transaction' })
  @Get(':id')
  findOne(@Param('id') id: string, @Param('workspaceId') workspaceId: string) {
    return this.transactionsService.findOne(id, workspaceId);
  }

  @ApiOperation({ summary: 'Update a transaction' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Param('workspaceId') workspaceId: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(id, workspaceId, updateTransactionDto);
  }

  @ApiOperation({ summary: 'Delete a transaction' })
  @Delete(':id')
  remove(@Param('id') id: string, @Param('workspaceId') workspaceId: string) {
    return this.transactionsService.remove(id, workspaceId);
  }
}
