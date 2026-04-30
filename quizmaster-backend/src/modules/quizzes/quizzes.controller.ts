import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  HttpCode,
  Query,
} from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import {
  AddQuestionToQuizDto,
  CreateQuizDto,
  QueryQuizAdminDto,
  QueryQuizDto,
  UpdateQuizDto,
  VerifyQuizPasswordDto,
} from './dto/quiz.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from '../../common/guards/roles.guard';
import { GetCurrentUser } from '../../common/decorators/get-current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Roles(Role.admin)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(
    @GetCurrentUser('sub') userId: string,
    @Body() createQuizDto: CreateQuizDto,
  ) {
    return this.quizzesService.create(userId, createQuizDto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Get()
  findAll(@Query() query: QueryQuizDto) {
    return this.quizzesService.findAll(query);
  }

  @Roles(Role.admin)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @Get('admin/all')
  findAllAdmin(@Query() query: QueryQuizAdminDto) {
    return this.quizzesService.findAllAdmin(query);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizzesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.admin)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @GetCurrentUser('sub') userId: string,
    @GetCurrentUser('role') role: string,
    @Body() updateQuizDto: UpdateQuizDto,
  ) {
    return this.quizzesService.update(id, userId, role, updateQuizDto);
  }

  @Roles(Role.admin)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @GetCurrentUser('sub') userId: string,
    @GetCurrentUser('role') role: string,
  ) {
    return this.quizzesService.remove(id, userId, role);
  }

  @Patch(':id/restore')
  @Roles(Role.admin)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  restore(@Param('id') id: string) {
    return this.quizzesService.restore(id);
  }

  @Delete(':id/permanent')
  @Roles(Role.admin)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  removePermanent(@Param('id') id: string) {
    return this.quizzesService.removePermanent(id);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post(':id/verify')
  verifyPassword(@Param('id') id: string, @Body() dto: VerifyQuizPasswordDto) {
    return this.quizzesService.verifyPassword(id, dto);
  }

  @Roles(Role.admin)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @Post(':id/questions')
  addQuestion(@Param('id') id: string, @Body() dto: AddQuestionToQuizDto) {
    return this.quizzesService.addQuestion(id, dto);
  }

  @Post(':id/questions/bulk')
  addQuestionsBulk(
    @Param('id') id: string,
    @Body() questions: { questionId: string; orderIndex: number }[],
  ) {
    return this.quizzesService.addQuestionsToQuiz(id, questions);
  }

  @Roles(Role.admin)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @Delete(':id/questions/:questionId')
  removeQuestion(
    @Param('id') id: string,
    @Param('questionId') questionId: string,
  ) {
    return this.quizzesService.removeQuestion(id, questionId);
  }

  @Roles(Role.admin)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':id/password')
  getPlainPassword(@Param('id') id: string) {
    return this.quizzesService.getPlainPassword(id);
  }
}
