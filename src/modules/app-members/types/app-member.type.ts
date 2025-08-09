import { AppUser } from 'generated/prisma';

export type AppMember = AppUser & { user: { email: string } };
