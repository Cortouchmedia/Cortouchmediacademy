export declare class CloudinaryService {
    private readonly cloudinary;
    private readonly logger;
    constructor(cloudinary: any);
    uploadVideo(fileBuffer: Buffer, options?: {
        folder?: string;
        public_id?: string;
        eager?: any[];
        eager_async?: boolean;
        overwrite?: boolean;
        invalidate?: boolean;
    }): Promise<any>;
    deleteVideo(publicId: string): Promise<any>;
    getVideoInfo(publicId: string): Promise<any>;
    generateVideoUrl(publicId: string, options?: {
        quality?: string;
        format?: string;
        start_offset?: number;
        end_offset?: number;
        streaming_profile?: string;
    }): string;
    generateHlsUrl(publicId: string): string;
    generateThumbnailUrl(publicId: string, options?: {
        width?: number;
        height?: number;
        time?: number;
    }): string;
    generateSpriteSheet(publicId: string): Promise<string>;
    uploadImage(fileBuffer: Buffer, options?: {
        folder?: string;
        public_id?: string;
        transformation?: any[];
    }): Promise<any>;
    deleteImage(publicId: string): Promise<any>;
    uploadFile(fileBuffer: Buffer, options?: {
        folder?: string;
        public_id?: string;
        resource_type?: string;
    }): Promise<any>;
    generateImageUrl(publicId: string, options?: {
        width?: number;
        height?: number;
        crop?: string;
        quality?: string;
        format?: string;
    }): string;
}
