// src/courses/dto/create-lesson.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
  IsArray,
} from "class-validator";

export class CreateLessonDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  video_url?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  video_duration?: number;

  @IsString()
  @IsOptional()
  text_content?: string;

  @IsArray()
  @IsOptional()
  resources?: any[];

  @IsNumber()
  @Min(0)
  order_number: number;

  @IsBoolean()
  @IsOptional()
  is_free?: boolean;
}
