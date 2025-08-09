import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { CurrentUserType } from '../types/current-user.types';
import { APP_ROLES_KEY } from '../decorators/app-role.decorator';
import { AppRole } from 'generated/prisma';
import { AppMembersService } from 'src/modules/app-members/app-members.service';

@Injectable()
export class AppRoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private appMemberService: AppMembersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<AppRole[]>(
      APP_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }
    const { user } = context
      .switchToHttp()
      .getRequest<{ user: CurrentUserType }>();

    const appId = this.extractAppId(context.switchToHttp().getRequest());

    if (!appId) {
      throw new ForbiddenException();
    }

    const userRole = await this.appMemberService.getRole(appId, user.id);

    if (!userRole) {
      throw new ForbiddenException();
    }

    return requiredRoles.includes(userRole);
  }

  private extractAppId(request: Request): string | null {
    if (request.params?.appId) {
      return request.params.appId;
    }

    if (request.query?.appId && typeof request.query.appId === 'string') {
      return request.query.appId;
    }

    return null;
  }
}
