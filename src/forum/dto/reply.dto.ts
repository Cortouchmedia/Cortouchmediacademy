import { IsString, IsNotEmpty } from 'class-validator';

export class CreateReplyDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class UpdateReplyDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}