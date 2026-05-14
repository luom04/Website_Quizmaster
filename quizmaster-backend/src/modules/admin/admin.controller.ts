import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminService } from './admin.service';
import {
  AdminDashboardQueryDto,
  AdminRecentAttemptsQueryDto,
  AdminSuspiciousAttemptsQueryDto,
  AdminTopQuizzesQueryDto,
  AdminAttemptEventsQueryDto,
} from './dto/admin.dto';

@Roles(Role.admin)
@UseGuards(RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @HttpCode(HttpStatus.OK)
  getDashboard(@Query() query: AdminDashboardQueryDto) {
    return this.adminService.getDashboard(query);
  }

  @Get('recent-attempts')
  @HttpCode(HttpStatus.OK)
  getRecentAttempts(@Query() query: AdminRecentAttemptsQueryDto) {
    return this.adminService.getRecentAttempts(query);
  }

  @Get('top-quizzes')
  @HttpCode(HttpStatus.OK)
  getTopQuizzes(@Query() query: AdminTopQuizzesQueryDto) {
    return this.adminService.getTopQuizzes(query);
  }

  @Get('suspicious-attempts')
  @HttpCode(HttpStatus.OK)
  getSuspiciousAttempts(@Query() query: AdminSuspiciousAttemptsQueryDto) {
    return this.adminService.getSuspiciousAttempts(query);
  }

  @Get('attempts/:attemptId/events')
  @HttpCode(HttpStatus.OK)
  getAttemptEvents(
    @Query() query: AdminAttemptEventsQueryDto,
    @Param('attemptId') attemptId: string,
  ) {
    return this.adminService.getAttemptEvents(attemptId, query);
  }
}
