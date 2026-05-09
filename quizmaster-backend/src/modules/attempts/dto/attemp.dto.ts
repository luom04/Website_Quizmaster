import { AttemptStatus, EventType } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class StartAttemptDto {
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsString()
  password?: string;
}

export class SubmitAnswerDto {
  @IsUUID()
  attemptQuestionId!: string;

  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  selectedOptionIds!: string[];
}

export class SubmitAttemptDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitAnswerDto)
  answers?: SubmitAnswerDto[];
}

export class QueryAttemptHistoryDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  quizId?: string;

  @IsOptional()
  @IsEnum(AttemptStatus)
  status?: AttemptStatus;
}

export class AttemptIdParamDto {
  @IsUUID()
  attemptId!: string;
}

export class QuizIdParamDto {
  @IsUUID()
  quizId!: string;
}

//evevt types

export class LogAttemptEventDto {
  @IsEnum(EventType)
  eventType!: EventType;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class QueryAttemptEventsDto extends PaginationDto {
  @IsOptional()
  @IsEnum(EventType)
  eventType?: EventType;
}
