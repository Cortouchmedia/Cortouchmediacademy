import { IsOptional, IsString, IsIn } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @IsIn(['STUDENT', 'INSTRUCTOR', 'ADMIN', 'SUPERADMIN'])
  role?: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN' | 'SUPERADMIN';
}