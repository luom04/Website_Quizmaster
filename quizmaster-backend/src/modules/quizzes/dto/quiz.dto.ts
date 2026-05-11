import { AccessMode } from '@prisma/client';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { PartialType } from '@nestjs/mapped-types';

export class CreateQuizDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsEnum(AccessMode)
  @IsOptional()
  accessMode?: AccessMode;

  @IsString()
  @IsOptional()
  password?: string; //password tu client gui len

  @IsInt()
  @Min(1)
  @IsOptional()
  durationMinutes?: number;

  @IsDateString()
  @IsOptional()
  startsAt?: string;

  @IsDateString()
  @IsOptional()
  endsAt?: string;

  @IsInt()
  @IsOptional()
  maxAttempts?: number;

  // Tổng điểm max là 10, nên passingScore nằm trong 0 -> 10
  @Type(() => Number)
  @Min(0)
  @Max(10)
  @IsOptional()
  passingScore?: number;

  @IsBoolean()
  @IsOptional()
  showAnswer?: boolean;

  @IsBoolean()
  @IsOptional()
  shuffleQuestions?: boolean;

  @IsBoolean()
  @IsOptional()
  shuffleOptions?: boolean;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}

export class UpdateQuizDto extends PartialType(CreateQuizDto) {}

export class VerifyQuizPasswordDto {
  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class AddQuestionToQuizDto {
  @IsUUID()
  @IsNotEmpty()
  questionId!: string;

  @IsInt()
  @Min(0)
  orderIndex!: number;
}
export class BulkAddQuestionItemDto {
  @IsUUID()
  @IsNotEmpty()
  questionId!: string;

  @IsInt()
  @Min(0)
  orderIndex!: number;
}

export class BulkAddQuestionsToQuizDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BulkAddQuestionItemDto)
  questions!: BulkAddQuestionItemDto[];
}
export enum QuizStatus {
  DRAFT = 'DRAFT',
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  ENDED = 'ENDED',
  DELETED = 'DELETED',
}

export enum QuizSortBy {
  CREATED_AT = 'createdAt',
  TITLE = 'title',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class QueryQuizDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @Type(() => Boolean)
  isPublished?: boolean;

  @IsOptional()
  @IsEnum(QuizStatus)
  status?: QuizStatus;

  @IsOptional()
  @IsEnum(QuizSortBy)
  sortBy?: QuizSortBy;

  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder;
}

export class QueryQuizAdminDto extends PaginationDto {
  @IsOptional()
  @IsEnum(QuizStatus)
  status?: QuizStatus;
}
