// src/cloudinary/cloudinary.service.ts
import { Injectable, Inject, Logger } from "@nestjs/common";
import { Readable } from "stream";

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(@Inject("CLOUDINARY") private readonly cloudinary: any) {}

  async uploadVideo(
    fileBuffer: Buffer,
    options: {
      folder?: string;
      public_id?: string;
      eager?: any[];
      eager_async?: boolean;
      overwrite?: boolean;
      invalidate?: boolean;
    } = {},
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          resource_type: "video",
          folder: options.folder || "course-videos",
          public_id: options.public_id,
          eager: options.eager || [
            { streaming_profile: "full_hd", format: "m3u8" },
            { format: "mp4" },
            { format: "webm" },
          ],
          eager_async:
            options.eager_async !== undefined ? options.eager_async : true,
          overwrite: options.overwrite !== undefined ? options.overwrite : true,
          invalidate:
            options.invalidate !== undefined ? options.invalidate : true,
        },
        (error, result) => {
          if (error) {
            this.logger.error(`Cloudinary upload error: ${error.message}`);
            reject(error);
          } else {
            this.logger.log(
              `Video uploaded successfully: ${result?.public_id}`,
            );
            resolve(result);
          }
        },
      );

      const readableStream = new Readable();
      readableStream.push(fileBuffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    });
  }

  async deleteVideo(publicId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.cloudinary.uploader.destroy(
        publicId,
        { resource_type: "video" },
        (error, result) => {
          if (error) {
            this.logger.error(`Cloudinary delete error: ${error.message}`);
            reject(error);
          } else {
            this.logger.log(`Video deleted: ${publicId}`);
            resolve(result);
          }
        },
      );
    });
  }

  async getVideoInfo(publicId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.cloudinary.api.resource(
        publicId,
        { resource_type: "video" },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      );
    });
  }

  generateVideoUrl(
    publicId: string,
    options: {
      quality?: string;
      format?: string;
      start_offset?: number;
      end_offset?: number;
      streaming_profile?: string;
    } = {},
  ): string {
    const transformation: any[] = [];

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

  generateHlsUrl(publicId: string): string {
    return this.cloudinary.url(publicId, {
      resource_type: "video",
      format: "m3u8",
      transformation: [{ streaming_profile: "full_hd" }],
    });
  }

  generateThumbnailUrl(
    publicId: string,
    options: { width?: number; height?: number; time?: number } = {},
  ): string {
    const transformation: any[] = [];

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

  async generateSpriteSheet(publicId: string): Promise<string> {
    return this.cloudinary.url(publicId, {
      resource_type: "video",
      transformation: [{ flags: "sprite" }, { format: "jpg" }],
    });
  }

  // src/cloudinary/cloudinary.service.ts - Add these methods

  async uploadImage(
    fileBuffer: Buffer,
    options: {
      folder?: string;
      public_id?: string;
      transformation?: any[];
    } = {},
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder: options.folder || "assets",
          public_id: options.public_id,
          transformation: options.transformation || [
            { quality: "auto" },
            { fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error) {
            this.logger.error(`Cloudinary upload error: ${error.message}`);
            reject(error);
          } else {
            this.logger.log(
              `Image uploaded successfully: ${result?.public_id}`,
            );
            resolve(result);
          }
        },
      );

      const readableStream = new Readable();
      readableStream.push(fileBuffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    });
  }

  async deleteImage(publicId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.cloudinary.uploader.destroy(
        publicId,
        { resource_type: "image" },
        (error, result) => {
          if (error) {
            this.logger.error(`Cloudinary delete error: ${error.message}`);
            reject(error);
          } else {
            this.logger.log(`Image deleted: ${publicId}`);
            resolve(result);
          }
        },
      );
    });
  }

  // Add to cloudinary.service.ts
  async uploadFile(
    fileBuffer: Buffer,
    options: {
      folder?: string;
      public_id?: string;
      resource_type?: string;
    } = {},
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          resource_type: options.resource_type || "auto",
          folder: options.folder || "uploads",
          public_id: options.public_id,
        },
        (error, result) => {
          if (error) {
            this.logger.error(`Cloudinary upload error: ${error.message}`);
            reject(error);
          } else {
            resolve(result);
          }
        },
      );

      const readableStream = new Readable();
      readableStream.push(fileBuffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    });
  }

  generateImageUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: string;
      format?: string;
    } = {},
  ): string {
    const transformation: any[] = [];

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
}
