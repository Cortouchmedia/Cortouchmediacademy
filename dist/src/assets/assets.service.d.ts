import { SupabaseService } from "../../supabase.service";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { UploadImageDto, UpdateAssetDto } from "./dto/asset.dto";
interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
}
export declare class AssetsService {
    private readonly supabaseService;
    private readonly cloudinaryService;
    private readonly logger;
    constructor(supabaseService: SupabaseService, cloudinaryService: CloudinaryService);
    getSupabaseClient(): import("@supabase/supabase-js/dist/index.cjs").SupabaseClient<any, "public", "public", any, any>;
    uploadImage(uploadDto: UploadImageDto, file: MulterFile): Promise<{
        success: boolean;
        message: string;
        asset: any;
        variants: {
            original: any;
            large: string;
            medium: string;
            small: string;
            thumbnail: string;
        };
    }>;
    getAssetsByEntity(entityType: string, entityId: string): Promise<any[]>;
    getPrimaryAsset(entityType: string, entityId: string, type: string): Promise<any>;
    setPrimaryAsset(assetId: string, entityType: string, entityId: string): Promise<{
        success: boolean;
        message: string;
        asset: any;
    }>;
    updateAsset(assetId: string, updateDto: UpdateAssetDto): Promise<{
        success: boolean;
        message: string;
        asset: any;
    }>;
    deleteAsset(assetId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private updateEntityImage;
    uploadMultipleImages(files: MulterFile[], uploadDto: UploadImageDto): Promise<{
        success: boolean;
        uploaded: number;
        failed: number;
        results: any[];
        errors: any[];
    }>;
    getEntityAssetsSummary(entityType: string, entityId: string): Promise<{
        type: string;
        count: number;
    }[]>;
}
export {};
