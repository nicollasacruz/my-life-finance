import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { WorkspaceType } from '@prisma/client';

export class CreateWorkspaceDto {
  @ApiProperty({ example: 'Casa' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'casa', description: 'URL-friendly identifier (lowercase, no spaces)' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  })
  slug!: string;

  @ApiPropertyOptional({ enum: WorkspaceType, default: WorkspaceType.PERSONAL })
  @IsEnum(WorkspaceType)
  @IsOptional()
  type?: WorkspaceType;

  @ApiPropertyOptional({ example: 'Despesas da casa' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'EUR', default: 'EUR' })
  @IsString()
  @IsOptional()
  currency?: string;
}
