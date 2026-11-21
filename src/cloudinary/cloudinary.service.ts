import { Injectable, Inject, Logger } from "@nestjs/common";
import { Readable } from "stream";

type ResourceType = "image" | "video" | "raw";

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(@Inject("CLOUDINARY") private readonly cloudinary: any) {}

  // ---------------------------------------------------------------------------
  // Video upload
  // ---------------------------------------------------------------------------
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
          eager: options.eager,
          eager_async: options.eager_async,
          overwrite: options.overwrite !== undefined ? options.overwrite : true,
          invalidate:
            options.invalidate !== undefined ? options.invalidate : true,
        },
        (error: any, result: any) => {
          if (error) {
            this.logger.error(`Cloudinary upload error: ${error.message}`);
            reject(error);
          } else {
            this.logger.log(`Video uploaded: ${result?.public_id}`);
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
  async deleteFile(
    publicId: string,
    options: { resource_type?: ResourceType | "auto" } = {},
  ): Promise<any> {
    const requested = options.resource_type ?? "image";
    const types: ResourceType[] =
      requested === "auto" ? ["video", "image", "raw"] : [requested];

    let lastErr: any = null;
    for (const rt of types) {
      try {
        const result = await new Promise<any>((resolve, reject) => {
          this.cloudinary.uploader.destroy(
            publicId,
            { resource_type: rt, invalidate: true },
            (error: any, result: any) =>
              error ? reject(error) : resolve(result),
          );
        });
        if (result?.result === "ok") return result;
      } catch (err) {
        lastErr = err;
      }
    }
    if (lastErr) throw lastErr;
    return { result: "not found" };
  }

  async destroyVideo(publicId: string): Promise<any> {
    return this.deleteVideo(publicId);
  }

  async deleteVideo(publicId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.cloudinary.uploader.destroy(
        publicId,
        { resource_type: "video", invalidate: true },
        (error: any, result: any) => {
          if (error) {
            this.logger.error(`Cloudinary delete error: ${error.message}`);
            reject(error);
          } else {
            if (result?.result !== "ok" && result?.result !== "not found") {
              this.logger.warn(
                `Cloudinary delete for video/${publicId} returned "${result?.result}"`,
              );
            }
            this.logger.log(`Video deleted: ${publicId}`);
            resolve(result);
          }
        },
      );
    });
  }

  async deleteImage(publicId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.cloudinary.uploader.destroy(
        publicId,
        { resource_type: "image", invalidate: true },
        (error: any, result: any) => {
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

  generateUploadSignature(
    folder = "course-content",
    resourceType: ResourceType = "video",
  ): {
    timestamp: number;
    signature: string;
    folder: string;
    resource_type: ResourceType;
    api_key: string;
    cloud_name: string;
    upload_url: string;
  } {
    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign = { timestamp, folder };  // ✅ only these two

    const signature = this.cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!,
    );

    // ✅ ADD THIS LINE BACK:
    const cloud_name = process.env.CLOUDINARY_CLOUD_NAME!;

    return {
      timestamp,
      signature,
      folder,
      resource_type: resourceType,
      api_key: process.env.CLOUDINARY_API_KEY!,
      cloud_name, // ✅ Now this variable exists
      upload_url: `https://api.cloudinary.com/v1_1/${cloud_name}/${resourceType}/upload`, // ✅ And this works
    };
  }

  // ---------------------------------------------------------------------------
  // Generic file upload (used for lesson attachments: PDFs, docs, etc.)
  // ---------------------------------------------------------------------------
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
        (error: any, result: any) => {
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

  // ---------------------------------------------------------------------------
  // Image upload
  // ---------------------------------------------------------------------------
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
          resource_type: "image",
          folder: options.folder || "assets",
          public_id: options.public_id,
          transformation: options.transformation || [
            { quality: "auto" },
            { fetch_format: "auto" },
          ],
        },
        (error: any, result: any) => {
          if (error) {
            this.logger.error(`Cloudinary upload error: ${error.message}`);
            reject(error);
          } else {
            this.logger.log(`Image uploaded: ${result?.public_id}`);
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

  // ---------------------------------------------------------------------------
  // URL builders
  // ---------------------------------------------------------------------------
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
      secure: true,
    });
  }

  generateHlsUrl(publicId: string): string {
    return this.cloudinary.url(publicId, {
      resource_type: "video",
      format: "m3u8",
      transformation: [{ streaming_profile: "full_hd" }],
      secure: true,
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
      secure: true,
    });
  }

  async generateSpriteSheet(publicId: string): Promise<string> {
    return this.cloudinary.url(publicId, {
      resource_type: "video",
      transformation: [{ flags: "sprite" }, { format: "jpg" }],
      secure: true,
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
      secure: true,
    });
  }

  // ---------------------------------------------------------------------------
  // Misc
  // ---------------------------------------------------------------------------
  async getVideoInfo(publicId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.cloudinary.api.resource(
        publicId,
        { resource_type: "video" },
        (error: any, result: any) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
    });
  }
}