import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsDateString,
  ValidateIf,
} from 'class-validator';
import { AccountType, RecurrenceType } from '@prisma/client';

export class CreateAccountDto {
  @ApiProperty({ example: 'Renda' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Pagamento mensal da renda' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: AccountType, example: AccountType.FIXED })
  @IsEnum(AccountType)
  type!: AccountType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ example: '#3B82F6' })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ example: 'home' })
  @IsString()
  @IsOptional()
  icon?: string;

  // FIXED account fields
  @ApiPropertyOptional({ example: true, description: 'For FIXED: true = fixed amount, false = variable (e.g. utilities)' })
  @ValidateIf((o) => o.type === AccountType.FIXED)
  @IsBoolean()
  @IsOptional()
  isAmountFixed?: boolean;

  @ApiPropertyOptional({ example: 850.50, description: 'For FIXED with fixed amount' })
  @ValidateIf((o) => o.type === AccountType.FIXED && o.isAmountFixed)
  @IsNumber()
  @IsOptional()
  fixedAmount?: number;

  @ApiPropertyOptional({ example: 5, description: 'For FIXED: day of month (1-31)' })
  @ValidateIf((o) => o.type === AccountType.FIXED)
  @IsNumber()
  @Min(1)
  @Max(31)
  @IsOptional()
  dueDay?: number;

  @ApiPropertyOptional({ enum: RecurrenceType, default: RecurrenceType.MONTHLY })
  @ValidateIf((o) => o.type === AccountType.FIXED)
  @IsEnum(RecurrenceType)
  @IsOptional()
  recurrence?: RecurrenceType;

  @ApiPropertyOptional({ example: 3, default: 3, description: 'Days before due date to alert' })
  @IsNumber()
  @IsOptional()
  alertDaysBefore?: number;

  // BUDGET account fields
  @ApiPropertyOptional({ example: 300.00, description: 'For BUDGET: monthly budget amount' })
  @ValidateIf((o) => o.type === AccountType.BUDGET)
  @IsNumber()
  @IsOptional()
  budgetAmount?: number;

  @ApiPropertyOptional({ example: 80, default: 80, description: 'For BUDGET: % of budget to trigger alert' })
  @IsNumber()
  @IsOptional()
  alertBudgetPercent?: number;

  // Common fields
  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: '2024-01-01', description: 'When to start generating instances' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-12-31', description: 'When to stop generating instances' })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}
