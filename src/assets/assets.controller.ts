// src/assets/assets.controller.ts
import {
  Controller,
  Post,
  Get,
  Delete,
  Put,
  Body,
  Param,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
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

@Controller("api/assets")
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  // ==================== SINGLE IMAGE UPLOAD ====================

  @Post("upload")
  @UseInterceptors(FileInterceptor("image"))
  async uploadImage(
    @UploadedFile() file: MulterFile,
    @Body() uploadDto: UploadImageDto,
  ) {
    if (!file) {
      throw new BadRequestException("Image file is required");
    }
    return this.assetsService.uploadImage(uploadDto, file);
  }

  // ==================== MULTIPLE IMAGES UPLOAD ====================

  @Post("upload-multiple")
  @UseInterceptors(FilesInterceptor("images", 10))
  async uploadMultipleImages(
    @UploadedFiles() files: MulterFile[],
    @Body() uploadDto: UploadImageDto,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException("At least one image file is required");
    }
    return this.assetsService.uploadMultipleImages(files, uploadDto);
  }

  // ==================== ASSET MANAGEMENT ====================

  @Get("entity/:entityType/:entityId")
  async getAssetsByEntity(
    @Param("entityType") entityType: string,
    @Param("entityId") entityId: string,
  ) {
    return this.assetsService.getAssetsByEntity(entityType, entityId);
  }

  @Get("entity/:entityType/:entityId/primary")
  async getPrimaryAsset(
    @Param("entityType") entityType: string,
    @Param("entityId") entityId: string,
    @Query("type") type: string,
  ) {
    return this.assetsService.getPrimaryAsset(entityType, entityId, type);
  }

  @Get("entity/:entityType/:entityId/summary")
  async getEntityAssetsSummary(
    @Param("entityType") entityType: string,
    @Param("entityId") entityId: string,
  ) {
    return this.assetsService.getEntityAssetsSummary(entityType, entityId);
  }

  @Put("assets/:assetId/primary")
  async setPrimaryAsset(
    @Param("assetId") assetId: string,
    @Body("entity_type") entityType: string,
    @Body("entity_id") entityId: string,
  ) {
    return this.assetsService.setPrimaryAsset(assetId, entityType, entityId);
  }

  @Put("assets/:assetId")
  async updateAsset(
    @Param("assetId") assetId: string,
    @Body() updateDto: UpdateAssetDto,
  ) {
    // Add update method to service if needed
    return this.assetsService.updateAsset(assetId, updateDto);
  }

  @Delete("assets/:assetId")
  async deleteAsset(@Param("assetId") assetId: string) {
    return this.assetsService.deleteAsset(assetId);
  }
}
