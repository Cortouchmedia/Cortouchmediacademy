// src/courses/dto/lesson-progress.dto.ts
import { IsUUID, IsBoolean, IsOptional, IsNumber, Min } from "class-validator";

export class LessonProgressDto {
  @IsUUID()
  lesson_id: string;

  @IsBoolean()
  is_completed: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  last_watched_position?: number;
}
