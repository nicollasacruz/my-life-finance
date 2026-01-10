import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsDateString } from 'class-validator';

export class MarkPaidDto {
  @ApiPropertyOptional({ example: 850.50, description: 'Confirmed amount paid (for variable FIXED accounts)' })
  @IsNumber()
  @IsOptional()
  confirmedAmount?: number;

  @ApiPropertyOptional({ example: '2024-01-15', description: 'Date when payment was made' })
  @IsDateString()
  @IsOptional()
  paidAt?: string;
}
