import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsDateString, IsString } from 'class-validator';

export class UpdateInstanceDto {
  @ApiPropertyOptional({ example: 850.50, description: 'Update estimated amount' })
  @IsNumber()
  @IsOptional()
  estimatedAmount?: number;

  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({ example: 'Payment delayed by landlord' })
  @IsString()
  @IsOptional()
  notes?: string;
}
