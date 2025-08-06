import { User } from 'generated/prisma';

export type CurrentUserType = Pick<User, 'id' | 'email' | 'role'>;
