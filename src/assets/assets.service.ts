// src/assets/assets.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { UploadImageDto, UpdateAssetDto } from "./dto/asset.dto";
import { v4 as uuidv4 } from "uuid";

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class AssetsService {
  private readonly logger = new Logger(AssetsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  getSupabaseClient() {
    return this.supabaseService.getAdminClient();
  }

  // ==================== IMAGE UPLOAD ====================

  async uploadImage(uploadDto: UploadImageDto, file: MulterFile) {
    const supabase = this.getSupabaseClient();

    // Debug logging
    this.logger.log(`File received: ${file.originalname}`);
    this.logger.log(`MIME type: ${file.mimetype}`);
    this.logger.log(`File size: ${file.size}`);

    // Check if file exists
    if (!file || !file.buffer) {
      throw new BadRequestException("No file uploaded or file is empty");
    }

    // Check if it's an image
    if (!file.mimetype || !file.mimetype.startsWith("image/")) {
      throw new BadRequestException(
        `File must be an image. Received: ${file.mimetype || "unknown"}`,
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException(`File too large. Maximum size is 5MB.`);
    }

    // Generate unique public ID
    const publicId = uuidv4();

    try {
      // Upload to Cloudinary
      const uploadResult = await this.cloudinaryService.uploadImage(
        file.buffer,
        {
          folder: `assets/${uploadDto.entity_type}s/${uploadDto.entity_id}/${uploadDto.type}`,
          public_id: publicId,
          transformation: [
            { width: 800, height: 600, crop: "limit", quality: "auto" },
            { fetch_format: "auto" },
          ],
        },
      );

      const variants = {
        original: uploadResult.secure_url,
        large: this.cloudinaryService.generateImageUrl(uploadResult.public_id, {
          width: 800,
          height: 600,
          crop: "limit",
        }),
        medium: this.cloudinaryService.generateImageUrl(uploadResult.public_id, {
          width: 400,
          height: 300,
          crop: "limit",
        }),
        small: this.cloudinaryService.generateImageUrl(uploadResult.public_id, {
          width: 200,
          height: 150,
          crop: "limit",
        }),
        thumbnail: this.cloudinaryService.generateImageUrl(uploadResult.public_id, {
          width: 100,
          height: 100,
          crop: "thumb",
        }),
      };
      
      // Save to database
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
        throw new BadRequestException(`Failed to save asset: ${error.message}`);
      }

      // Update the associated entity's image field
      await this.updateEntityImage(
        uploadDto.entity_type,
        uploadDto.entity_id,
        uploadResult.secure_url,
        uploadDto.type,
      );

      return {
        success: true,
        message: "Image uploaded successfully",
        asset,
        variants,
      };
    } catch (error: any) {
      this.logger.error(`Upload error: ${error.message}`);
      throw new BadRequestException(`Failed to upload image: ${error.message}`);
    }
  }

  // ==================== ASSET MANAGEMENT ====================

  async getAssetsByEntity(entityType: string, entityId: string) {
    const supabase = this.getSupabaseClient();

    const { data, error } = await supabase
      .from("assets")
      .select("*")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new BadRequestException(`Failed to fetch assets: ${error.message}`);
    }

    return data || [];
  }

  async getPrimaryAsset(entityType: string, entityId: string, type: string) {
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
      throw new BadRequestException(
        `Failed to fetch primary asset: ${error.message}`,
      );
    }

    return data;
  }

  async setPrimaryAsset(assetId: string, entityType: string, entityId: string) {
    const supabase = this.getSupabaseClient();

    // First, remove primary flag from all assets of this type
    await supabase
      .from("assets")
      .update({ is_primary: false })
      .eq("entity_type", entityType)
      .eq("entity_id", entityId);

    // Set the selected asset as primary
    const { data, error } = await supabase
      .from("assets")
      .update({ is_primary: true })
      .eq("id", assetId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Failed to set primary asset: ${error.message}`,
      );
    }

    return { success: true, message: "Primary asset updated", asset: data };
  }

  async updateAsset(assetId: string, updateDto: UpdateAssetDto) {
    const supabase = this.getSupabaseClient();

    const updateData: any = {
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
      throw new BadRequestException(`Failed to update asset: ${error.message}`);
    }

    return {
      success: true,
      message: "Asset updated successfully",
      asset: data,
    };
  }

  async deleteAsset(assetId: string) {
    const supabase = this.getSupabaseClient();

    // Get asset info
    const { data: asset } = await supabase
      .from("assets")
      .select("public_id, entity_type, entity_id, type")
      .eq("id", assetId)
      .single();

    if (!asset) {
      throw new NotFoundException("Asset not found");
    }

    // Delete from Cloudinary
    await this.cloudinaryService.deleteImage(asset.public_id);

    // Delete from database
    const { error } = await supabase.from("assets").delete().eq("id", assetId);

    if (error) {
      throw new BadRequestException(`Failed to delete asset: ${error.message}`);
    }

    // Update entity's image field if this was the primary asset
    await this.updateEntityImage(
      asset.entity_type,
      asset.entity_id,
      null,
      asset.type,
    );

    return { success: true, message: "Asset deleted successfully" };
  }

  // ==================== HELPER METHODS ====================

  private async updateEntityImage(
    entityType: string,
    entityId: string,
    imageUrl: string | null,
    imageType: string,
  ) {
    const supabase = this.getSupabaseClient();

    let tableName: string;
    let fieldName: string;

    // Determine which table and field to update
    switch (entityType) {
      case "course":
        tableName = "courses";
        fieldName = imageType === "thumbnail" ? "image_url" : "cover_url";
        break;
        case "user":
          tableName = "profiles";
          fieldName = "profile_picture";
          await supabase
            .from("profiles")
            .update({
              avatar_url: imageUrl,
              updated_at: new Date(),
            })
            .eq("id", entityId);
          break;
      case "lesson":
        tableName = "course_lessons";
        fieldName = "thumbnail_url";
        break;
      default:
        return;
    }

    const updateData: any = {};
    updateData[fieldName] = imageUrl;
    updateData.updated_at = new Date();

    await supabase.from(tableName).update(updateData).eq("id", entityId);
  }

  // ==================== BULK OPERATIONS ====================

  async uploadMultipleImages(files: MulterFile[], uploadDto: UploadImageDto) {
    const results = [];
    const errors = [];

    for (const file of files) {
      try {
        const result = await this.uploadImage(uploadDto, file);
        results.push(result);
      } catch (error: any) {
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

  async getEntityAssetsSummary(entityType: string, entityId: string) {
    const supabase = this.getSupabaseClient();

    // Get all assets for the entity
    const { data, error } = await supabase
      .from("assets")
      .select("type")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId);

    if (error) {
      throw new BadRequestException(
        `Failed to fetch assets summary: ${error.message}`,
      );
    }

    // Count by type manually
    const summary: Record<string, number> = {};
    data?.forEach((asset) => {
      summary[asset.type] = (summary[asset.type] || 0) + 1;
    });

    // Convert to array format
    const result = Object.entries(summary).map(([type, count]) => ({
      type,
      count,
    }));

    return result;
  }
}
