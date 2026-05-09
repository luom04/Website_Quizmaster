import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { Role } from '@prisma/client';
import { GetCurrentUser } from '../../common/decorators/get-current-user.decorator';
import {
  AttemptIdParamDto,
  LogAttemptEventDto,
  QueryAttemptEventsDto,
  QueryAttemptHistoryDto,
  QuizIdParamDto,
  StartAttemptDto,
  SubmitAttemptDto,
} from './dto/attemp.dto';
import { AttemptsService } from './attempts.service';

@Controller('attempts')
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  @Post('start/:quizId')
  startAttempt(
    @Param() params: QuizIdParamDto,
    @GetCurrentUser('sub') userId: string,
    @Body() dto: StartAttemptDto,
    @Req() req: any,
  ) {
    return this.attemptsService.startAttempt(params.quizId, userId, dto, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Post(':attemptId/submit')
  submitAttempt(
    @Param() params: AttemptIdParamDto,
    @GetCurrentUser('sub') userId: string,
    @Body() dto: SubmitAttemptDto,
  ) {
    return this.attemptsService.submitAttempt(params.attemptId, userId, dto);
  }

  @Get('my-history')
  getMyHistory(
    @GetCurrentUser('sub') userId: string,
    @Query() query: QueryAttemptHistoryDto,
  ) {
    return this.attemptsService.getMyHistory(userId, query);
  }

  @Get('quiz/:quizId/my-attempts')
  getMyQuizAttempts(
    @Param() params: QuizIdParamDto,
    @GetCurrentUser('sub') userId: string,
    @Query() query: QueryAttemptHistoryDto,
  ) {
    return this.attemptsService.getMyQuizAttempts(params.quizId, userId, query);
  }

  @Get(':attemptId/result')
  getResult(
    @Param() params: AttemptIdParamDto,
    @GetCurrentUser('sub') userId: string,
    @GetCurrentUser('role') role: Role,
  ) {
    return this.attemptsService.getResult(params.attemptId, userId, role);
  }

  //event types

  @Post(':attemptId/events')
  logAttemptEvent(
    @Param() params: AttemptIdParamDto,
    @GetCurrentUser('sub') userId: string,
    @Body() dto: LogAttemptEventDto,
  ) {
    return this.attemptsService.logAttemptEvent(params.attemptId, userId, dto);
  }

  @Get(':attemptId/events')
  getAttemptEvents(
    @Param() params: AttemptIdParamDto,
    @GetCurrentUser('sub') userId: string,
    @GetCurrentUser('role') role: Role,
    @Query() query: QueryAttemptEventsDto,
  ) {
    return this.attemptsService.getAttemptEvents(
      params.attemptId,
      userId,
      role,
      query,
    );
  }
}
