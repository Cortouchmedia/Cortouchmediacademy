export declare class UploadImageDto {
    entity_type: "course" | "user" | "lesson" | "webinar";
    entity_id: string;
    type: "thumbnail" | "avatar" | "cover" | "banner";
    alt_text?: string;
}
export declare class UpdateAssetDto {
    alt_text?: string;
    is_primary?: boolean;
}
export declare class DeleteAssetDto {
    asset_id: string;
    entity_type: string;
    entity_id: string;
}
