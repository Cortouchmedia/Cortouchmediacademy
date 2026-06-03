// src/courses/dto/enroll-course.dto.ts
import { IsUUID } from "class-validator";

export class EnrollCourseDto {
  @IsUUID()
  course_id: string;
}
