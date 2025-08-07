import { SetMetadata } from '@nestjs/common';
import { AppRole } from 'generated/prisma';

export const APP_ROLES_KEY = 'appRoles';
export const AppRoles = (...roles: AppRole[]) =>
  SetMetadata(APP_ROLES_KEY, roles);
