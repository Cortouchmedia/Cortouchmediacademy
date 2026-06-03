// src/assets/dto/asset.dto.ts
export class UploadImageDto {
  entity_type: "course" | "user" | "lesson" | "webinar";
  entity_id: string;
  type: "thumbnail" | "avatar" | "cover" | "banner";
  alt_text?: string;
}

export class UpdateAssetDto {
  alt_text?: string;
  is_primary?: boolean;
}

export class DeleteAssetDto {
  asset_id: string;
  entity_type: string;
  entity_id: string;
}
