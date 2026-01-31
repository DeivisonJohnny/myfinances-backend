
import { Module } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { AuditLogsController } from './audit-logs.controller';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [AuditLogsController],
  providers: [AuditLogsService, PrismaClient],
})
export class AuditLogsModule {}
