import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

export type HealthPayload = {
  status: 'ok' | 'degraded';
  database: 'up' | 'down';
};

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getData() {
    return { message: 'Hello API' };
  }

  async getHealth(): Promise<HealthPayload> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', database: 'up' };
    } catch {
      return { status: 'degraded', database: 'down' };
    }
  }
}
