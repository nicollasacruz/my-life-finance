import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MemberRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<MemberRole[]>(ROLES_KEY, context.getHandler());

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const member = request.workspaceMember;

    if (!member) {
      throw new ForbiddenException('Workspace member not found');
    }

    const hasRole = requiredRoles.includes(member.role);

    if (!hasRole) {
      throw new ForbiddenException(`Requires one of these roles: ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}
