import { SupabaseService } from "../../supabase.service";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { UploadVideoDto, UpdateVideoDto, TrackWatchProgressDto, AddVideoCommentDto } from "./dto/video.dto";
interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
}
export declare class VideosService {
    private readonly supabaseService;
    private readonly cloudinaryService;
    private readonly logger;
    constructor(supabaseService: SupabaseService, cloudinaryService: CloudinaryService);
    getSupabaseClient(): import("@supabase/supabase-js/dist/index.cjs").SupabaseClient<any, "public", "public", any, any>;
    private getCourseIdFromLesson;
    uploadVideo(uploadDto: UploadVideoDto, file: MulterFile): Promise<{
        success: boolean;
        message: string;
        video: any;
        streaming: {
            hls: string;
            mp4: string;
            thumbnail: string;
        };
    }>;
    getVideoById(videoId: string, userId?: string): Promise<any>;
    getVideosByLesson(lessonId: string): Promise<any[]>;
    getAllVideos(): Promise<any[]>;
    updateVideo(videoId: string, updateDto: UpdateVideoDto): Promise<any>;
    deleteVideo(videoId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getStreamingUrl(videoId: string, quality?: string): Promise<{
        hls: string;
        mp4: any;
        sprite: string;
        poster: string;
    }>;
    trackWatchProgress(trackDto: TrackWatchProgressDto): Promise<{
        success: boolean;
        progress: any;
        completed: boolean;
    }>;
    getUserProgress(userId: string, videoId: string): Promise<any>;
    private trackView;
    private updateVideoAnalytics;
    addComment(commentDto: AddVideoCommentDto): Promise<any>;
    getComments(videoId: string, limit?: number): Promise<any[]>;
    likeComment(commentId: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
export {};
