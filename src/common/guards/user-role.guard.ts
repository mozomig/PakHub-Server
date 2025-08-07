import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'generated/prisma';
import { USER_ROLES_KEY } from '../decorators/user-role.decorator';
import { CurrentUserType } from '../types/current-user.types';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      USER_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }
    const { user } = context
      .switchToHttp()
      .getRequest<{ user: CurrentUserType }>();
    return requiredRoles.some((role) => user.role === role);
  }
}
