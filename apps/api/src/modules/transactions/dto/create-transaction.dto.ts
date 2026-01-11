import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({ example: 'clx123456789' })
  @IsString()
  @IsNotEmpty()
  accountInstanceId!: string;

  @ApiProperty({ example: 45.50 })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiPropertyOptional({ example: 'Compra no supermercado' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  @IsDateString()
  date!: string;

  @ApiPropertyOptional({ example: 'Continente - Lisboa' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ example: 'https://example.com/receipt.jpg' })
  @IsString()
  @IsOptional()
  attachmentUrl?: string;
}
