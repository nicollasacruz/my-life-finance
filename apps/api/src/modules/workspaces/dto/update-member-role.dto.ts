import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { MemberRole } from '@prisma/client';

export class UpdateMemberRoleDto {
  @ApiProperty({ enum: MemberRole })
  @IsEnum(MemberRole)
  @IsNotEmpty()
  role!: MemberRole;
}
