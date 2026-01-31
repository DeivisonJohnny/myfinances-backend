
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CurrentUserType } from '../../types/current-user-type';
import { Role, Roles } from 'src/auth/decorators/roles.decorator';

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(user: CurrentUserType) {

    return this.prisma.auditLog.findMany({
      where: {
        accountId: user.accountId,
      },
      include: {
        user: {
            select: {
                id: true,
                name: true,
                email: true
            }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
