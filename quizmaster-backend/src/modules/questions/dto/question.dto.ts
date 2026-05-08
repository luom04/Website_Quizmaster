import { PartialType } from '@nestjs/mapped-types';
import { QuestionType } from '@prisma/client';
import { Type } from 'class-transformer';
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
} from 'class-validator';

export class CreateOptionDto {
  @IsNotEmpty()
  @IsString()
  content!: string;

  @IsNotEmpty()
  @IsBoolean()
  isCorrect!: boolean;

  @IsInt()
  orderIndex!: number;
}

export class CreateQuestionDto {
  @IsString()
  @IsOptional()
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
