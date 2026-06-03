"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AssetsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase.service");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
const uuid_1 = require("uuid");
let AssetsService = AssetsService_1 = class AssetsService {
    constructor(supabaseService, cloudinaryService) {
        this.supabaseService = supabaseService;
        this.cloudinaryService = cloudinaryService;
        this.logger = new common_1.Logger(AssetsService_1.name);
    }
    getSupabaseClient() {
        return this.supabaseService.getClient();
    }
    async uploadImage(uploadDto, file) {
        const supabase = this.getSupabaseClient();
        this.logger.log(`File received: ${file.originalname}`);
        this.logger.log(`MIME type: ${file.mimetype}`);
        this.logger.log(`File size: ${file.size}`);
        if (!file || !file.buffer) {
            throw new common_1.BadRequestException("No file uploaded or file is empty");
        }
        if (!file.mimetype || !file.mimetype.startsWith("image/")) {
            throw new common_1.BadRequestException(`File must be an image. Received: ${file.mimetype || "unknown"}`);
        }
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new common_1.BadRequestException(`File too large. Maximum size is 5MB.`);
        }
        const publicId = `${uploadDto.entity_type}/${uploadDto.entity_id}/${uploadDto.type}/${(0, uuid_1.v4)()}`;
        try {
            const uploadResult = await this.cloudinaryService.uploadImage(file.buffer, {
                folder: `assets/${uploadDto.entity_type}s/${uploadDto.type}`,
                public_id: publicId,
                transformation: [
                    { width: 800, height: 600, crop: "limit", quality: "auto" },
                    { fetch_format: "auto" },
                ],
            });
            const variants = {
                original: uploadResult.secure_url,
                large: this.cloudinaryService.generateImageUrl(publicId, {
                    width: 800,
                    height: 600,
                    crop: "limit",
                }),
                medium: this.cloudinaryService.generateImageUrl(publicId, {
                    width: 400,
                    height: 300,
                    crop: "limit",
                }),
                small: this.cloudinaryService.generateImageUrl(publicId, {
                    width: 200,
                    height: 150,
                    crop: "limit",
                }),
                thumbnail: this.cloudinaryService.generateImageUrl(publicId, {
                    width: 100,
                    height: 100,
                    crop: "thumb",
                }),
            };
            const { data: asset, error } = await supabase
                .from("assets")
                .insert({
                entity_type: uploadDto.entity_type,
                entity_id: uploadDto.entity_id,
                type: uploadDto.type,
                url: uploadResult.secure_url,
                variants: variants,
                public_id: uploadResult.public_id,
                alt_text: uploadDto.alt_text,
                mime_type: file.mimetype,
                size: file.size,
                format: file.mimetype.split("/")[1],
                created_at: new Date(),
                updated_at: new Date(),
            })
                .select()
                .single();
            if (error) {
                this.logger.error(`Failed to save asset: ${error.message}`);
                throw new common_1.BadRequestException(`Failed to save asset: ${error.message}`);
            }
            await this.updateEntityImage(uploadDto.entity_type, uploadDto.entity_id, uploadResult.secure_url, uploadDto.type);
            return {
                success: true,
                message: "Image uploaded successfully",
                asset,
                variants,
            };
        }
        catch (error) {
            this.logger.error(`Upload error: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to upload image: ${error.message}`);
        }
    }
    async getAssetsByEntity(entityType, entityId) {
        const supabase = this.getSupabaseClient();
        const { data, error } = await supabase
            .from("assets")
            .select("*")
            .eq("entity_type", entityType)
            .eq("entity_id", entityId)
            .order("created_at", { ascending: false });
        if (error) {
            throw new common_1.BadRequestException(`Failed to fetch assets: ${error.message}`);
        }
        return data || [];
    }
    async getPrimaryAsset(entityType, entityId, type) {
        const supabase = this.getSupabaseClient();
        const { data, error } = await supabase
            .from("assets")
            .select("*")
            .eq("entity_type", entityType)
            .eq("entity_id", entityId)
            .eq("type", type)
            .eq("is_primary", true)
            .maybeSingle();
        if (error) {
            throw new common_1.BadRequestException(`Failed to fetch primary asset: ${error.message}`);
        }
        return data;
    }
    async setPrimaryAsset(assetId, entityType, entityId) {
        const supabase = this.getSupabaseClient();
        await supabase
            .from("assets")
            .update({ is_primary: false })
            .eq("entity_type", entityType)
            .eq("entity_id", entityId);
        const { data, error } = await supabase
            .from("assets")
            .update({ is_primary: true })
            .eq("id", assetId)
            .select()
            .single();
        if (error) {
            throw new common_1.BadRequestException(`Failed to set primary asset: ${error.message}`);
        }
        return { success: true, message: "Primary asset updated", asset: data };
    }
    async updateAsset(assetId, updateDto) {
        const supabase = this.getSupabaseClient();
        const updateData = {
            updated_at: new Date(),
        };
        if (updateDto.alt_text !== undefined) {
            updateData.alt_text = updateDto.alt_text;
        }
        if (updateDto.is_primary !== undefined) {
            updateData.is_primary = updateDto.is_primary;
        }
        const { data, error } = await supabase
            .from("assets")
            .update(updateData)
            .eq("id", assetId)
            .select()
            .single();
        if (error) {
            throw new common_1.BadRequestException(`Failed to update asset: ${error.message}`);
        }
        return {
            success: true,
            message: "Asset updated successfully",
            asset: data,
        };
    }
    async deleteAsset(assetId) {
        const supabase = this.getSupabaseClient();
        const { data: asset } = await supabase
            .from("assets")
            .select("public_id, entity_type, entity_id, type")
            .eq("id", assetId)
            .single();
        if (!asset) {
            throw new common_1.NotFoundException("Asset not found");
        }
        await this.cloudinaryService.deleteImage(asset.public_id);
        const { error } = await supabase.from("assets").delete().eq("id", assetId);
        if (error) {
            throw new common_1.BadRequestException(`Failed to delete asset: ${error.message}`);
        }
        await this.updateEntityImage(asset.entity_type, asset.entity_id, null, asset.type);
        return { success: true, message: "Asset deleted successfully" };
    }
    async updateEntityImage(entityType, entityId, imageUrl, imageType) {
        const supabase = this.getSupabaseClient();
        let tableName;
        let fieldName;
        switch (entityType) {
            case "course":
                tableName = "courses";
                fieldName = imageType === "thumbnail" ? "image_url" : "cover_url";
                break;
            case "user":
                tableName = "profiles";
                fieldName = "profile_picture";
                break;
            case "lesson":
                tableName = "course_lessons";
                fieldName = "thumbnail_url";
                break;
            default:
                return;
        }
        const updateData = {};
        updateData[fieldName] = imageUrl;
        updateData.updated_at = new Date();
        await supabase.from(tableName).update(updateData).eq("id", entityId);
    }
    async uploadMultipleImages(files, uploadDto) {
        const results = [];
        const errors = [];
        for (const file of files) {
            try {
                const result = await this.uploadImage(uploadDto, file);
                results.push(result);
            }
            catch (error) {
                errors.push({ filename: file.originalname, error: error.message });
            }
        }
        return {
            success: true,
            uploaded: results.length,
            failed: errors.length,
            results,
            errors,
        };
    }
    async getEntityAssetsSummary(entityType, entityId) {
        const supabase = this.getSupabaseClient();
        const { data, error } = await supabase
            .from("assets")
            .select("type")
            .eq("entity_type", entityType)
            .eq("entity_id", entityId);
        if (error) {
            throw new common_1.BadRequestException(`Failed to fetch assets summary: ${error.message}`);
        }
        const summary = {};
        data?.forEach((asset) => {
            summary[asset.type] = (summary[asset.type] || 0) + 1;
        });
        const result = Object.entries(summary).map(([type, count]) => ({
            type,
            count,
        }));
        return result;
    }
};
exports.AssetsService = AssetsService;
exports.AssetsService = AssetsService = AssetsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService,
        cloudinary_service_1.CloudinaryService])
], AssetsService);
//# sourceMappingURL=assets.service.js.map