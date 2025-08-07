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
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AppRoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
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

    //TODO: add cache
    const appUser = await this.prisma.appUser.findUnique({
      where: {
        appId_userId: {
          appId,
          userId: user.id,
        },
      },
      select: { role: true },
    });

    if (!appUser) {
      throw new ForbiddenException();
    }

    return requiredRoles.includes(appUser.role);
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
