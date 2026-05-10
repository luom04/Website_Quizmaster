import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminService } from './admin.service';
import {
  AdminDashboardQueryDto,
  AdminRecentAttemptsQueryDto,
  AdminSuspiciousAttemptsQueryDto,
  AdminTopQuizzesQueryDto,
} from './dto/admin.dto';

@Roles(Role.admin)
@UseGuards(RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  getDashboard(@Query() query: AdminDashboardQueryDto) {
    return this.adminService.getDashboard(query);
  }

  @Get('recent-attempts')
  getRecentAttempts(@Query() query: AdminRecentAttemptsQueryDto) {
    return this.adminService.getRecentAttempts(query);
  }

  @Get('top-quizzes')
  getTopQuizzes(@Query() query: AdminTopQuizzesQueryDto) {
    return this.adminService.getTopQuizzes(query);
  }

  @Get('suspicious-attempts')
  getSuspiciousAttempts(@Query() query: AdminSuspiciousAttemptsQueryDto) {
    return this.adminService.getSuspiciousAttempts(query);
  }
}
