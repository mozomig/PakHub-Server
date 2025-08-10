import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infra/prisma/prisma.service';
import { UserEntity } from './entity/user.entity';

const USER_CACHE_KEY = (id: string) => `user:${id}`;
const USER_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(email: string, password: string): Promise<UserEntity> {
    const user = await this.prisma.user.create({
      data: {
        email,
        password,
      },
    });

    const currentUser = new UserEntity(user);

    await this.cacheUser(currentUser);

    return currentUser;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const cachedUser = await this.cacheManager.get<UserEntity>(
      USER_CACHE_KEY(email),
    );
    if (cachedUser) {
      return cachedUser;
    }

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user) {
      await this.cacheUser(new UserEntity(user));
    }

    return user ? new UserEntity(user) : null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const cachedUser = await this.cacheManager.get<UserEntity>(
      USER_CACHE_KEY(id),
    );
    if (cachedUser) {
      return cachedUser;
    }
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (user) {
      await this.cacheUser(new UserEntity(user));
    }

    return user ? new UserEntity(user) : null;
  }

  async getHashedPassword(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.password;
  }

  private async cacheUser(user: UserEntity) {
    await Promise.allSettled([
      this.cacheManager.set(USER_CACHE_KEY(user.id), user, USER_CACHE_TTL),
      this.cacheManager.set(USER_CACHE_KEY(user.email), user, USER_CACHE_TTL),
    ]);
  }
}
