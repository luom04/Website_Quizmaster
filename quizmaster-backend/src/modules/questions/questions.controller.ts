import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/question.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { QuestionType, Role } from '@prisma/client';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Roles(Role.admin)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(@Body() createQuestionDto: CreateQuestionDto) {
    return this.questionsService.create(createQuestionDto);
  }

  @Roles(Role.admin)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  findAll(
    @Query() pagination: PaginationDto,
    @Query('categoryId') categoryId?: string,
    @Query('type') type?: QuestionType,
    @Query('search') search?: string,
  ) {
    return this.questionsService.findAll({
      pagination,
      categoryId,
      type,
      search,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionsService.findOne(id);
  }

  @Roles(Role.admin)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: CreateQuestionDto) {
    return this.questionsService.update(id, dto);
  }

  @Roles(Role.admin)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionsService.remove(id);
  }

  @Delete(':id/permanent')
  @Roles(Role.admin)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  removePermanent(@Param('id') id: string) {
    return this.questionsService.removePermanent(id);
  }

  @Post('import')
  @Roles(Role.admin)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  importMany(@Body() dtos: CreateQuestionDto[]) {
    return this.questionsService.importQuestions(dtos);
  }
}
