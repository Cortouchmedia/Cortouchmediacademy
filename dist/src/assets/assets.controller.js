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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const assets_service_1 = require("./assets.service");
const asset_dto_1 = require("./dto/asset.dto");
let AssetsController = class AssetsController {
    constructor(assetsService) {
        this.assetsService = assetsService;
    }
    async uploadImage(file, uploadDto) {
        if (!file) {
            throw new common_1.BadRequestException("Image file is required");
        }
        return this.assetsService.uploadImage(uploadDto, file);
    }
    async uploadMultipleImages(files, uploadDto) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException("At least one image file is required");
        }
        return this.assetsService.uploadMultipleImages(files, uploadDto);
    }
    async getAssetsByEntity(entityType, entityId) {
        return this.assetsService.getAssetsByEntity(entityType, entityId);
    }
    async getPrimaryAsset(entityType, entityId, type) {
        return this.assetsService.getPrimaryAsset(entityType, entityId, type);
    }
    async getEntityAssetsSummary(entityType, entityId) {
        return this.assetsService.getEntityAssetsSummary(entityType, entityId);
    }
    async setPrimaryAsset(assetId, entityType, entityId) {
        return this.assetsService.setPrimaryAsset(assetId, entityType, entityId);
    }
    async updateAsset(assetId, updateDto) {
        return this.assetsService.updateAsset(assetId, updateDto);
    }
    async deleteAsset(assetId) {
        return this.assetsService.deleteAsset(assetId);
    }
};
exports.AssetsController = AssetsController;
__decorate([
    (0, common_1.Post)("upload"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("image")),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, asset_dto_1.UploadImageDto]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "uploadImage", null);
__decorate([
    (0, common_1.Post)("upload-multiple"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)("images", 10)),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, asset_dto_1.UploadImageDto]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "uploadMultipleImages", null);
__decorate([
    (0, common_1.Get)("entity/:entityType/:entityId"),
    __param(0, (0, common_1.Param)("entityType")),
    __param(1, (0, common_1.Param)("entityId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "getAssetsByEntity", null);
__decorate([
    (0, common_1.Get)("entity/:entityType/:entityId/primary"),
    __param(0, (0, common_1.Param)("entityType")),
    __param(1, (0, common_1.Param)("entityId")),
    __param(2, (0, common_1.Query)("type")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "getPrimaryAsset", null);
__decorate([
    (0, common_1.Get)("entity/:entityType/:entityId/summary"),
    __param(0, (0, common_1.Param)("entityType")),
    __param(1, (0, common_1.Param)("entityId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "getEntityAssetsSummary", null);
__decorate([
    (0, common_1.Put)("assets/:assetId/primary"),
    __param(0, (0, common_1.Param)("assetId")),
    __param(1, (0, common_1.Body)("entity_type")),
    __param(2, (0, common_1.Body)("entity_id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "setPrimaryAsset", null);
__decorate([
    (0, common_1.Put)("assets/:assetId"),
    __param(0, (0, common_1.Param)("assetId")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, asset_dto_1.UpdateAssetDto]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "updateAsset", null);
__decorate([
    (0, common_1.Delete)("assets/:assetId"),
    __param(0, (0, common_1.Param)("assetId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "deleteAsset", null);
exports.AssetsController = AssetsController = __decorate([
    (0, common_1.Controller)("api/assets"),
    __metadata("design:paramtypes", [assets_service_1.AssetsService])
], AssetsController);
//# sourceMappingURL=assets.controller.js.map