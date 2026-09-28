import {
  IsEmail,
  IsString,
  MinLength,
  IsIn,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  full_name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsIn(['STUDENT', 'INSTRUCTOR', 'ADMIN', 'SUPERADMIN'])
  role?: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN' | 'SUPERADMIN';
}