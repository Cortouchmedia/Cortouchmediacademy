export declare class UploadVideoDto {
    lesson_id: string;
    title: string;
    description?: string;
    is_preview?: boolean;
    allow_download?: boolean;
}
export declare class UpdateVideoDto {
    title?: string;
    description?: string;
    video_quality?: string;
    allow_download?: boolean;
    is_preview?: boolean;
}
export declare class TrackWatchProgressDto {
    video_id: string;
    user_id: string;
    watch_time: number;
    last_position: number;
    completed?: boolean;
}
export declare class AddVideoCommentDto {
    video_id: string;
    user_id: string;
    comment: string;
    timestamp_seconds?: number;
    parent_id?: string;
}
