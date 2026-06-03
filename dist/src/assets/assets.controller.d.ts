import { AssetsService } from "./assets.service";
import { UploadImageDto, UpdateAssetDto } from "./dto/asset.dto";
interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
}
export declare class AssetsController {
    private readonly assetsService;
    constructor(assetsService: AssetsService);
    uploadImage(file: MulterFile, uploadDto: UploadImageDto): Promise<{
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
    uploadMultipleImages(files: MulterFile[], uploadDto: UploadImageDto): Promise<{
        success: boolean;
        uploaded: number;
        failed: number;
        results: any[];
        errors: any[];
    }>;
    getAssetsByEntity(entityType: string, entityId: string): Promise<any[]>;
    getPrimaryAsset(entityType: string, entityId: string, type: string): Promise<any>;
    getEntityAssetsSummary(entityType: string, entityId: string): Promise<{
        type: string;
        count: number;
    }[]>;
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
}
export {};
