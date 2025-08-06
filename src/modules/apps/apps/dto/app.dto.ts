import { Expose } from 'class-transformer';
import { App } from 'generated/prisma';

export class AppDto implements Partial<App> {
  constructor(app: App) {
    Object.assign(this, app);
  }

  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  logoUrl?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
