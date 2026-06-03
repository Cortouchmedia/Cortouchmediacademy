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
exports.VideosController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const videos_service_1 = require("./videos.service");
const video_dto_1 = require("./dto/video.dto");
let VideosController = class VideosController {
    constructor(videosService) {
        this.videosService = videosService;
    }
    async uploadVideo(file, uploadDto) {
        if (!file) {
            throw new common_1.BadRequestException("Video file is required");
        }
        return this.videosService.uploadVideo(uploadDto, file);
    }
    async getVideoById(id, userId) {
        return this.videosService.getVideoById(id, userId);
    }
    async getVideosByLesson(lessonId) {
        return this.videosService.getVideosByLesson(lessonId);
    }
    async updateVideo(id, updateDto) {
        return this.videosService.updateVideo(id, updateDto);
    }
    async deleteVideo(id) {
        return this.videosService.deleteVideo(id);
    }
    async trackProgress(trackDto) {
        return this.videosService.trackWatchProgress(trackDto);
    }
    async getUserProgress(videoId, userId) {
        return this.videosService.getUserProgress(userId, videoId);
    }
    async getStreamingUrl(id, quality) {
        return this.videosService.getStreamingUrl(id, quality);
    }
    async addComment(commentDto) {
        return this.videosService.addComment(commentDto);
    }
    async getComments(videoId, limit) {
        return this.videosService.getComments(videoId, limit ? +limit : 50);
    }
    async likeComment(commentId, userId) {
        return this.videosService.likeComment(commentId, userId);
    }
};
exports.VideosController = VideosController;
__decorate([
    (0, common_1.Post)("upload"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file")),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, video_dto_1.UploadVideoDto]),
    __metadata("design:returntype", Promise)
], VideosController.prototype, "uploadVideo", null);
__decorate([
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], VideosController.prototype, "getVideoById", null);
__decorate([
    (0, common_1.Get)("lesson/:lessonId"),
    __param(0, (0, common_1.Param)("lessonId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VideosController.prototype, "getVideosByLesson", null);
__decorate([
    (0, common_1.Put)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, video_dto_1.UpdateVideoDto]),
    __metadata("design:returntype", Promise)
], VideosController.prototype, "updateVideo", null);
__decorate([
    (0, common_1.Delete)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VideosController.prototype, "deleteVideo", null);
__decorate([
    (0, common_1.Post)("progress"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [video_dto_1.TrackWatchProgressDto]),
    __metadata("design:returntype", Promise)
], VideosController.prototype, "trackProgress", null);
__decorate([
    (0, common_1.Get)("progress/:videoId/:userId"),
    __param(0, (0, common_1.Param)("videoId")),
    __param(1, (0, common_1.Param)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], VideosController.prototype, "getUserProgress", null);
__decorate([
    (0, common_1.Get)("stream/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("quality")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], VideosController.prototype, "getStreamingUrl", null);
__decorate([
    (0, common_1.Post)("comments"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [video_dto_1.AddVideoCommentDto]),
    __metadata("design:returntype", Promise)
], VideosController.prototype, "addComment", null);
__decorate([
    (0, common_1.Get)(":videoId/comments"),
    __param(0, (0, common_1.Param)("videoId")),
    __param(1, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], VideosController.prototype, "getComments", null);
__decorate([
    (0, common_1.Post)("comments/:commentId/like"),
    __param(0, (0, common_1.Param)("commentId")),
    __param(1, (0, common_1.Query)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], VideosController.prototype, "likeComment", null);
exports.VideosController = VideosController = __decorate([
    (0, common_1.Controller)("api/videos"),
    __metadata("design:paramtypes", [videos_service_1.VideosService])
], VideosController);
//# sourceMappingURL=videos.controller.js.map