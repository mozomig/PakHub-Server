import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'generated/prisma';

export const USER_ROLES_KEY = 'userRoles';
export const UserRoles = (...roles: UserRole[]) =>
  SetMetadata(USER_ROLES_KEY, roles);
