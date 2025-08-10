import { UserRole } from 'generated/prisma';

export type CurrentUserType = {
  id: string;
  email: string;
  role: UserRole;
};
