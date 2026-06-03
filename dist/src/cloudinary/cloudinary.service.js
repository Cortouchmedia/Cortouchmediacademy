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
var CloudinaryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
const common_1 = require("@nestjs/common");
const stream_1 = require("stream");
let CloudinaryService = CloudinaryService_1 = class CloudinaryService {
    constructor(cloudinary) {
        this.cloudinary = cloudinary;
        this.logger = new common_1.Logger(CloudinaryService_1.name);
    }
    async uploadVideo(fileBuffer, options = {}) {
        return new Promise((resolve, reject) => {
            const uploadStream = this.cloudinary.uploader.upload_stream({
                resource_type: "video",
                folder: options.folder || "course-videos",
                public_id: options.public_id,
                eager: options.eager || [
                    { streaming_profile: "full_hd", format: "m3u8" },
                    { format: "mp4" },
                    { format: "webm" },
                ],
                eager_async: options.eager_async !== undefined ? options.eager_async : true,
                overwrite: options.overwrite !== undefined ? options.overwrite : true,
                invalidate: options.invalidate !== undefined ? options.invalidate : true,
            }, (error, result) => {
                if (error) {
                    this.logger.error(`Cloudinary upload error: ${error.message}`);
                    reject(error);
                }
                else {
                    this.logger.log(`Video uploaded successfully: ${result?.public_id}`);
                    resolve(result);
                }
            });
            const readableStream = new stream_1.Readable();
            readableStream.push(fileBuffer);
            readableStream.push(null);
            readableStream.pipe(uploadStream);
        });
    }
    async deleteVideo(publicId) {
        return new Promise((resolve, reject) => {
            this.cloudinary.uploader.destroy(publicId, { resource_type: "video" }, (error, result) => {
                if (error) {
                    this.logger.error(`Cloudinary delete error: ${error.message}`);
                    reject(error);
                }
                else {
                    this.logger.log(`Video deleted: ${publicId}`);
                    resolve(result);
                }
            });
        });
    }
    async getVideoInfo(publicId) {
        return new Promise((resolve, reject) => {
            this.cloudinary.api.resource(publicId, { resource_type: "video" }, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
    generateVideoUrl(publicId, options = {}) {
        const transformation = [];
        if (options.quality) {
            transformation.push({ quality: options.quality });
        }
        if (options.start_offset !== undefined) {
            transformation.push({ start_offset: options.start_offset });
        }
        if (options.end_offset !== undefined) {
            transformation.push({ end_offset: options.end_offset });
        }
        if (options.streaming_profile) {
            transformation.push({ streaming_profile: options.streaming_profile });
        }
        return this.cloudinary.url(publicId, {
            resource_type: "video",
            format: options.format || "mp4",
            transformation: transformation.length > 0 ? transformation : undefined,
        });
    }
    generateHlsUrl(publicId) {
        return this.cloudinary.url(publicId, {
            resource_type: "video",
            format: "m3u8",
            transformation: [{ streaming_profile: "full_hd" }],
        });
    }
    generateThumbnailUrl(publicId, options = {}) {
        const transformation = [];
        if (options.time !== undefined) {
            transformation.push({ start_offset: options.time });
        }
        if (options.width || options.height) {
            transformation.push({
                width: options.width || 640,
                height: options.height || 360,
                crop: "fill",
            });
        }
        transformation.push({ format: "jpg" });
        return this.cloudinary.url(publicId, {
            resource_type: "video",
            transformation,
        });
    }
    async generateSpriteSheet(publicId) {
        return this.cloudinary.url(publicId, {
            resource_type: "video",
            transformation: [{ flags: "sprite" }, { format: "jpg" }],
        });
    }
    async uploadImage(fileBuffer, options = {}) {
        return new Promise((resolve, reject) => {
            const uploadStream = this.cloudinary.uploader.upload_stream({
                folder: options.folder || "assets",
                public_id: options.public_id,
                transformation: options.transformation || [
                    { quality: "auto" },
                    { fetch_format: "auto" },
                ],
            }, (error, result) => {
                if (error) {
                    this.logger.error(`Cloudinary upload error: ${error.message}`);
                    reject(error);
                }
                else {
                    this.logger.log(`Image uploaded successfully: ${result?.public_id}`);
                    resolve(result);
                }
            });
            const readableStream = new stream_1.Readable();
            readableStream.push(fileBuffer);
            readableStream.push(null);
            readableStream.pipe(uploadStream);
        });
    }
    async deleteImage(publicId) {
        return new Promise((resolve, reject) => {
            this.cloudinary.uploader.destroy(publicId, { resource_type: "image" }, (error, result) => {
                if (error) {
                    this.logger.error(`Cloudinary delete error: ${error.message}`);
                    reject(error);
                }
                else {
                    this.logger.log(`Image deleted: ${publicId}`);
                    resolve(result);
                }
            });
        });
    }
    async uploadFile(fileBuffer, options = {}) {
        return new Promise((resolve, reject) => {
            const uploadStream = this.cloudinary.uploader.upload_stream({
                resource_type: options.resource_type || "auto",
                folder: options.folder || "uploads",
                public_id: options.public_id,
            }, (error, result) => {
                if (error) {
                    this.logger.error(`Cloudinary upload error: ${error.message}`);
                    reject(error);
                }
                else {
                    resolve(result);
                }
            });
            const readableStream = new stream_1.Readable();
            readableStream.push(fileBuffer);
            readableStream.push(null);
            readableStream.pipe(uploadStream);
        });
    }
    generateImageUrl(publicId, options = {}) {
        const transformation = [];
        if (options.width || options.height) {
            transformation.push({
                width: options.width || "auto",
                height: options.height || "auto",
                crop: options.crop || "limit",
            });
        }
        if (options.quality) {
            transformation.push({ quality: options.quality });
        }
        if (options.format) {
            transformation.push({ format: options.format });
        }
        transformation.push({ fetch_format: "auto" });
        return this.cloudinary.url(publicId, {
            resource_type: "image",
            transformation: transformation.length > 0 ? transformation : undefined,
        });
    }
};
exports.CloudinaryService = CloudinaryService;
exports.CloudinaryService = CloudinaryService = CloudinaryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)("CLOUDINARY")),
    __metadata("design:paramtypes", [Object])
], CloudinaryService);
//# sourceMappingURL=cloudinary.service.js.map