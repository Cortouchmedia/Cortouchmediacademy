import { VideosService } from "./videos.service";
import { UploadVideoDto, UpdateVideoDto, TrackWatchProgressDto, AddVideoCommentDto } from "./dto/video.dto";
interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
}
export declare class VideosController {
    private readonly videosService;
    constructor(videosService: VideosService);
    uploadVideo(file: MulterFile, uploadDto: UploadVideoDto): Promise<{
        success: boolean;
        message: string;
        video: any;
        streaming: {
            hls: string;
            mp4: string;
            thumbnail: string;
        };
    }>;
    getVideoById(id: string, userId?: string): Promise<any>;
    getVideosByLesson(lessonId: string): Promise<any[]>;
    updateVideo(id: string, updateDto: UpdateVideoDto): Promise<any>;
    deleteVideo(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    trackProgress(trackDto: TrackWatchProgressDto): Promise<{
        success: boolean;
        progress: any;
        completed: boolean;
    }>;
    getUserProgress(videoId: string, userId: string): Promise<any>;
    getStreamingUrl(id: string, quality?: string): Promise<{
        hls: string;
        mp4: any;
        sprite: string;
        poster: string;
    }>;
    addComment(commentDto: AddVideoCommentDto): Promise<any>;
    getComments(videoId: string, limit?: number): Promise<any[]>;
    likeComment(commentId: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
export {};
