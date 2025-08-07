import { Expose } from 'class-transformer';

export class FileDto {
  constructor(id: string) {
    this.id = id;
  }

  @Expose()
  id: string;
}
