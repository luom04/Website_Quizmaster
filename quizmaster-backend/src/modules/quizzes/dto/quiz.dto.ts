import { AccessMode } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class CreateQuizDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  categoryId!: string;

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
  startAt?: string;

  @IsDateString()
  @IsOptional()
  endAt?: string;

  @IsInt()
  @IsOptional()
  maxAttempts?: number;
}

export class UpdateQuizDto extends CreateQuizDto {
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean; // Bật/tắt trạng thái công khai
}

export class VerifyQuizPasswordDto {
  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class AddQuestionToQuizDto {
  @IsString()
  @IsNotEmpty()
  questionId!: string;

  @IsInt()
  @Min(0)
  orderIndex!: number;
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
