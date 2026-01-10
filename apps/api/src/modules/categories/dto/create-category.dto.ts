import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsHexColor, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Alimentação' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: '#3B82F6', default: '#6B7280' })
  @IsHexColor()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ example: 'shopping-cart' })
  @IsString()
  @IsOptional()
  icon?: string;
}
