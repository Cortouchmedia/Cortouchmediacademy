import { IsEmail, IsString, MinLength, IsIn, IsOptional } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsIn(['STUDENT', 'INSTRUCTOR', 'ADMIN', 'SUPERADMIN'])
  role?: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN' | 'SUPERADMIN';
}