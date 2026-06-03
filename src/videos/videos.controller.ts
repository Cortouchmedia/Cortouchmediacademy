// src/videos/videos.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { VideosService } from "./videos.service";
import {
  UploadVideoDto,
  UpdateVideoDto,
  TrackWatchProgressDto,
  AddVideoCommentDto,
} from "./dto/video.dto";

// Define Multer file type locally
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Controller("api/videos")
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  // ==================== VIDEO UPLOAD ====================

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  async uploadVideo(
    @UploadedFile() file: MulterFile,
    @Body() uploadDto: UploadVideoDto,
  ) {
    if (!file) {
      throw new BadRequestException("Video file is required");
    }
    return this.videosService.uploadVideo(uploadDto, file);
  }

  // ==================== VIDEO MANAGEMENT ====================

  @Get(":id")
  async getVideoById(
    @Param("id") id: string,
    @Query("userId") userId?: string,
  ) {
    return this.videosService.getVideoById(id, userId);
  }

  @Get("lesson/:lessonId")
  async getVideosByLesson(@Param("lessonId") lessonId: string) {
    return this.videosService.getVideosByLesson(lessonId);
  }

  @Put(":id")
  async updateVideo(
    @Param("id") id: string,
    @Body() updateDto: UpdateVideoDto,
  ) {
    return this.videosService.updateVideo(id, updateDto);
  }

  @Delete(":id")
  async deleteVideo(@Param("id") id: string) {
    return this.videosService.deleteVideo(id);
  }

  // ==================== WATCH PROGRESS ====================

  @Post("progress")
  async trackProgress(@Body() trackDto: TrackWatchProgressDto) {
    return this.videosService.trackWatchProgress(trackDto);
  }

  @Get("progress/:videoId/:userId")
  async getUserProgress(
    @Param("videoId") videoId: string,
    @Param("userId") userId: string,
  ) {
    return this.videosService.getUserProgress(userId, videoId);
  }

  // ==================== STREAMING ====================

  @Get("stream/:id")
  async getStreamingUrl(
    @Param("id") id: string,
    @Query("quality") quality?: string,
  ) {
    return this.videosService.getStreamingUrl(id, quality);
  }

  // ==================== COMMENTS ====================

  @Post("comments")
  async addComment(@Body() commentDto: AddVideoCommentDto) {
    return this.videosService.addComment(commentDto);
  }

  @Get(":videoId/comments")
  async getComments(
    @Param("videoId") videoId: string,
    @Query("limit") limit?: number,
  ) {
    return this.videosService.getComments(videoId, limit ? +limit : 50);
  }

  @Post("comments/:commentId/like")
  async likeComment(
    @Param("commentId") commentId: string,
    @Query("userId") userId: string,
  ) {
    return this.videosService.likeComment(commentId, userId);
  }
}
