import { SetMetadata } from '@nestjs/common';
import { MemberRole } from '@prisma/client';
import { ROLES_KEY } from '../guards/roles.guard';

export const Roles = (...roles: MemberRole[]) => SetMetadata(ROLES_KEY, roles);
