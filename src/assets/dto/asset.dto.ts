import { IsString, IsOptional, IsIn } from 'class-validator';

export class UploadImageDto {
  @IsString()
  @IsIn(['course', 'user', 'lesson', 'webinar'])
  entity_type: 'course' | 'user' | 'lesson' | 'webinar';

  @IsString()
  entity_id: string;

  @IsString()
  @IsIn(['thumbnail', 'avatar', 'cover', 'banner'])
  type: 'thumbnail' | 'avatar' | 'cover' | 'banner';

  @IsOptional()
  @IsString()
  alt_text?: string;
}

export class UpdateAssetDto {
  @IsOptional()
  @IsString()
  alt_text?: string;

  @IsOptional()
  is_primary?: boolean;
}

export class DeleteAssetDto {
  @IsString()
  asset_id: string;

  @IsString()
  entity_type: string;

  @IsString()
  entity_id: string;
}