// src/courses/dto/create-review.dto.ts
import {
  IsUUID,
  IsNumber,
  IsString,
  IsOptional,
  Min,
  Max,
} from "class-validator";

export class CreateReviewDto {
  @IsUUID()
  course_id: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsOptional()
  review?: string;
}
