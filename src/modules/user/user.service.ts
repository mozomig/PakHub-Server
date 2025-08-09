import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CurrentUserType } from 'src/common/types/current-user.types';
import { PrismaService } from 'src/prisma/prisma.service';

const USER_CACHE_KEY = 'user';
const USER_CACHE_TTL = 15 * 60 * 1000; // 15 minutes
@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(email: string, password: string): Promise<CurrentUserType> {
    const user = await this.prisma.user.create({
      data: {
        email,
        password,
      },
    });

    const currentUser = new CurrentUserType(user);

    await this.cacheUser(currentUser);

    return currentUser;
  }

  async findByEmail(email: string): Promise<CurrentUserType | null> {
    const cachedUser = await this.cacheManager.get<CurrentUserType>(
      `${USER_CACHE_KEY}:${email}`,
    );
    if (cachedUser) {
      return cachedUser;
    }

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user) {
      await this.cacheUser(new CurrentUserType(user));
    }

    return user ? new CurrentUserType(user) : null;
  }

  async findById(id: string): Promise<CurrentUserType | null> {
    const cachedUser = await this.cacheManager.get<CurrentUserType>(
      `${USER_CACHE_KEY}:${id}`,
    );
    if (cachedUser) {
      return cachedUser;
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (user) {
      await this.cacheUser(new CurrentUserType(user));
    }

    return user ? new CurrentUserType(user) : null;
  }

  async getHashedPassword(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.password;
  }

  private async cacheUser(user: CurrentUserType) {
    await Promise.allSettled([
      this.cacheManager.set(
        `${USER_CACHE_KEY}:${user.id}`,
        user,
        USER_CACHE_TTL,
      ),
      this.cacheManager.set(
        `${USER_CACHE_KEY}:${user.email}`,
        user,
        USER_CACHE_TTL,
      ),
    ]);
  }
}
