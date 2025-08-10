import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { FileType, StorageProvider } from 'generated/prisma';
import { PrismaService } from 'src/infra/prisma/prisma.service';

enum BUCKETS {
  LOGO = 'logo',
  BUILDS = 'builds',
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;
  private readonly endpoint: string;
  private readonly presignedUrlExpiresIn: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.endpoint = this.configService.getOrThrow<string>('MINIO_ENDPOINT');
    const port = this.configService.getOrThrow<string>('MINIO_PORT');
    const accessKeyId =
      this.configService.getOrThrow<string>('MINIO_ACCESS_KEY');
    const secretAccessKey =
      this.configService.getOrThrow<string>('MINIO_SECRET_KEY');
    this.presignedUrlExpiresIn = this.configService.getOrThrow<number>(
      'PRESIGNED_URL_EXPIRES_IN',
    );

    this.s3Client = new S3Client({
      region: 'us-east-1',
      endpoint: `http://${this.endpoint}:${port}`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });

    this.logger.log(
      `Storage service initialized with endpoint: http://${this.endpoint}:${port}`,
    );
  }

  async upload(file: Express.Multer.File, type: FileType): Promise<string> {
    const key = randomUUID();
    const body = file.buffer;
    const contentType = file.mimetype;
    const metadata = {};
    const bucket = type === FileType.LOGO ? BUCKETS.LOGO : BUCKETS.BUILDS;

    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        Metadata: metadata,
      });

      await this.s3Client.send(command);
      const uploadedFile = await this.prisma.file.create({
        data: {
          type,
          fileName: file.originalname,
          fileSize: file.size,
          storageBucket: bucket,
          storagePath: key,
          storageProvider: StorageProvider.S3,
          mimeType: contentType,
        },
      });

      return uploadedFile.id;
    } catch (error) {
      this.logger.error(`Failed to upload file ${key}:`, error);
      throw new Error(`Failed to upload file: ${(error as Error).message}`);
    }
  }

  async getFileUrl(fileId: string): Promise<string> {
    const file = await this.prisma.file.findUnique({
      where: {
        id: fileId,
      },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (file.storageProvider !== StorageProvider.S3) {
      throw new BadRequestException('File is not stored in S3');
    }

    const bucket = file.storageBucket!;
    const key = file.storagePath;

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: this.presignedUrlExpiresIn,
    });

    return url;
  }

  async deleteFile(fileId: string): Promise<void> {
    const file = await this.prisma.file.findUnique({
      where: {
        id: fileId,
      },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (file.storageProvider !== StorageProvider.S3) {
      throw new BadRequestException('File is not stored in S3');
    }

    const bucket = file.storageBucket!;
    const key = file.storagePath;

    try {
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(
        `File deleted successfully: ${key} from bucket: ${bucket}`,
      );
    } catch (error) {
      this.logger.error(`Failed to delete file ${key}:`, error);
      throw new Error(`Failed to delete file: ${(error as Error).message}`);
    }
  }

  async fileExists(fileId: string): Promise<boolean> {
    const file = await this.prisma.file.findUnique({
      where: {
        id: fileId,
      },
    });

    if (!file) {
      return false;
    }

    if (file.storageProvider !== StorageProvider.S3) {
      throw new BadRequestException('File is not stored in S3');
    }

    const bucket = file.storageBucket!;
    const key = file.storagePath;

    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    await this.s3Client.send(command);
    return true;
  }
}
