
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentUserType } from '../../types/current-user-type';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Role, Roles } from '../../auth/decorators/roles.decorator';

@Controller('audit-logs')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  async findAll(@CurrentUser() user: CurrentUserType) {
    return this.auditLogsService.findAll(user);
  }
}
