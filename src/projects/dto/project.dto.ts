import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsNumber,
  IsDateString,
  IsBoolean,
  Min,
} from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  course_id: string;

  @IsString()
  @IsNotEmpty()
  instructor_id: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  instructions?: string;

  @IsArray()
  @IsOptional()
  requirements?: any[];

  @IsDateString()
  @IsOptional()
  due_date?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  max_file_size?: number;

  @IsArray()
  @IsOptional()
  allowed_file_types?: string[];

  @IsNumber()
  @IsOptional()
  @Min(1)
  max_submissions?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  points_possible?: number;

  @IsOptional()
  rubric?: any;
}

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  instructions?: string;

  @IsArray()
  @IsOptional()
  requirements?: any[];

  @IsDateString()
  @IsOptional()
  due_date?: string;

  @IsNumber()
  @IsOptional()
  max_file_size?: number;

  @IsArray()
  @IsOptional()
  allowed_file_types?: string[];

  @IsNumber()
  @IsOptional()
  max_submissions?: number;

  @IsNumber()
  @IsOptional()
  points_possible?: number;

  @IsOptional()
  rubric?: any;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

export class SubmitProjectDto {
  @IsString()
  @IsNotEmpty()
  project_id: string;

  @IsString()
  @IsNotEmpty()
  student_id: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  files?: any[];

  @IsString()
  @IsOptional()
  submission_url?: string;
}

export class GradeSubmissionDto {
  @IsNumber()
  grade: number;

  @IsString()
  feedback: string;

  @IsString()
  @IsNotEmpty()
  instructor_id: string;
}

export class AddCommentDto {
  @IsString()
  @IsNotEmpty()
  submission_id: string;

  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsString()
  @IsNotEmpty()
  comment: string;

  @IsArray()
  @IsOptional()
  attachments?: any[];
}