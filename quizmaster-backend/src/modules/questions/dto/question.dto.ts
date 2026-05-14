import { PaginationDto } from './../../../common/dto/pagination.dto';
import { PartialType } from '@nestjs/mapped-types';
import { QuestionType } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsUUID,
} from 'class-validator';

export class CreateOptionDto {
  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsNotEmpty()
  @IsBoolean()
  isCorrect!: boolean;

  @IsInt()
  orderIndex!: number;
}

export class CreateQuestionDto {
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsUUID()
  categoryId?: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsEnum(QuestionType)
  type!: QuestionType; //signer or multiple

  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => CreateOptionDto)
  options!: CreateOptionDto[];
}

export class UpdateQuestionDto extends PartialType(CreateQuestionDto) {}

export class QueryQuestionsDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsEnum(QuestionType)
  type?: QuestionType;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  includeDeleted?: boolean;
}
