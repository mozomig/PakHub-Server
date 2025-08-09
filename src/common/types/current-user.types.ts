import { User, UserRole } from 'generated/prisma';

export class CurrentUserType {
  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.role = user.role;
  }

  id: string;
  email: string;
  role: UserRole;
}
