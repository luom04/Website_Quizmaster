import { QuestionType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
  Min,
  IsArray,
  ValidateNested,
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

  @IsInt()
  @Min(1)
  points!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOptionDto)
  options!: CreateOptionDto[];
}
