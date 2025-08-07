import { Expose } from 'class-transformer';
import { App } from 'generated/prisma';

export class AppDto implements App {
  constructor(app: Partial<App>) {
    Object.assign(this, app);
  }

  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  logoId: string | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
