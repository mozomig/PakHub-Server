import { App } from 'generated/prisma';

export type AppSummary = App & {
  stages: {
    id: string;
    name: string;
    appId: string;
    createdAt: Date;
    updatedAt: Date;
    builds: {
      id: string;
      version: string;
      buildNumber: number | null;
      releaseNotes: string | null;
      fileId: string | null;
      createdAt: Date;
      updatedAt: Date;
      stageId: string;
    }[];
  }[];
};
