// src/videos/videos.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import {
  UploadVideoDto,
  UpdateVideoDto,
  TrackWatchProgressDto,
  AddVideoCommentDto,
} from "./dto/video.dto";
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
export class VideosService {
  private readonly logger = new Logger(VideosService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  getSupabaseClient() {
    return this.supabaseService.getClient();
  }

  // Helper method to extract course_id from lesson
  private getCourseIdFromLesson(lesson: any): string {
    try {
      const moduleData = lesson.module;
      if (!moduleData) return "general";

      if (Array.isArray(moduleData) && moduleData.length > 0) {
        const firstModule = moduleData[0];
        if (firstModule && firstModule.course_id) {
          return firstModule.course_id;
        }
      }

      if (typeof moduleData === "object" && moduleData.course_id) {
        return moduleData.course_id;
      }

      return "general";
    } catch (error) {
      return "general";
    }
  }

  // ==================== VIDEO UPLOAD ====================

  async uploadVideo(uploadDto: UploadVideoDto, file: MulterFile) {
    const supabase = this.getSupabaseClient();

    // Get lesson details
    const { data: lesson, error: lessonError } = await supabase
      .from("course_lessons")
      .select("id, title, module:module_id(course_id)")
      .eq("id", uploadDto.lesson_id)
      .single();

    if (lessonError || !lesson) {
      throw new NotFoundException("Lesson not found");
    }

    const courseId = this.getCourseIdFromLesson(lesson);
    const publicId = `${uploadDto.lesson_id}/${uuidv4()}`;

    try {
      const uploadResult = await this.cloudinaryService.uploadVideo(
        file.buffer,
        {
          folder: `courses/${courseId}/videos`,
          public_id: publicId,
          eager: [
            { streaming_profile: "full_hd", format: "m3u8" },
            { format: "mp4" },
            { format: "webm" },
          ],
        },
      );

      const hlsUrl = this.cloudinaryService.generateHlsUrl(
        uploadResult.public_id,
      );
      const mp4Url = this.cloudinaryService.generateVideoUrl(
        uploadResult.public_id,
        { format: "mp4" },
      );
      const thumbnailUrl = this.cloudinaryService.generateThumbnailUrl(
        uploadResult.public_id,
        { time: 5 },
      );

      // Create video record
      const { data: video, error: videoError } = await supabase
        .from("video_lessons")
        .insert({
          lesson_id: uploadDto.lesson_id,
          title: uploadDto.title,
          description: uploadDto.description,
          video_url: mp4Url,
          hls_url: hlsUrl,
          thumbnail_url: thumbnailUrl,
          cloudinary_public_id: uploadResult.public_id,
          video_duration: Math.round(uploadResult.duration || 0),
          video_size: file.size,
          video_quality: "720p",
          is_preview: uploadDto.is_preview || false,
          allow_download: uploadDto.allow_download || false,
          status: "ready",
          processing_completed_at: new Date(),
        })
        .select()
        .single();

      if (videoError) {
        throw new BadRequestException(
          `Failed to create video record: ${videoError.message}`,
        );
      }

      // Initialize analytics
      await supabase.from("video_analytics").insert({
        video_id: video.id,
        total_views: 0,
        unique_viewers: 0,
        total_watch_time: 0,
      });

      return {
        success: true,
        message: "Video uploaded successfully",
        video,
        streaming: { hls: hlsUrl, mp4: mp4Url, thumbnail: thumbnailUrl },
      };
    } catch (error: any) {
      throw new BadRequestException(`Failed to upload video: ${error.message}`);
    }
  }

  // ==================== VIDEO RETRIEVAL ====================

  async getVideoById(videoId: string, userId?: string) {
    const supabase = this.getSupabaseClient();

    // Simple query without complex joins
    const { data: video, error } = await supabase
      .from("video_lessons")
      .select("*")
      .eq("id", videoId)
      .single();

    if (error || !video) {
      throw new NotFoundException("Video not found");
    }

    // Get lesson separately
    const { data: lesson } = await supabase
      .from("course_lessons")
      .select("id, title")
      .eq("id", video.lesson_id)
      .maybeSingle();

    // Get analytics separately
    const { data: analytics } = await supabase
      .from("video_analytics")
      .select("*")
      .eq("video_id", videoId)
      .maybeSingle();

    // Get user progress
    let userProgress = null;
    if (userId) {
      const { data: progress } = await supabase
        .from("video_watch_history")
        .select("*")
        .eq("user_id", userId)
        .eq("video_id", videoId)
        .maybeSingle();
      userProgress = progress;
    }

    // Track view
    await this.trackView(videoId, userId);

    // Get streaming URLs
    const streamingUrl = await this.getStreamingUrl(videoId);

    return {
      ...video,
      lesson,
      analytics,
      user_progress: userProgress,
      streaming_url: streamingUrl,
    };
  }

  async getVideosByLesson(lessonId: string) {
    const supabase = this.getSupabaseClient();

    const { data, error } = await supabase
      .from("video_lessons")
      .select("*")
      .eq("lesson_id", lessonId)
      .order("created_at", { ascending: true });

    if (error) {
      throw new BadRequestException(`Failed to fetch videos: ${error.message}`);
    }

    return data || [];
  }

  async getAllVideos() {
    const supabase = this.getSupabaseClient();

    const { data, error } = await supabase
      .from("video_lessons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new BadRequestException(`Failed to fetch videos: ${error.message}`);
    }

    return data || [];
  }

  async updateVideo(videoId: string, updateDto: UpdateVideoDto) {
    const supabase = this.getSupabaseClient();

    const { data, error } = await supabase
      .from("video_lessons")
      .update({
        ...updateDto,
        updated_at: new Date(),
      })
      .eq("id", videoId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to update video: ${error.message}`);
    }

    return data;
  }

  async deleteVideo(videoId: string) {
    const supabase = this.getSupabaseClient();

    const { data: video } = await supabase
      .from("video_lessons")
      .select("cloudinary_public_id")
      .eq("id", videoId)
      .single();

    if (video?.cloudinary_public_id) {
      await this.cloudinaryService.deleteVideo(video.cloudinary_public_id);
    }

    const { error } = await supabase
      .from("video_lessons")
      .delete()
      .eq("id", videoId);

    if (error) {
      throw new BadRequestException(`Failed to delete video: ${error.message}`);
    }

    return { success: true, message: "Video deleted successfully" };
  }

  // ==================== STREAMING ====================

  async getStreamingUrl(videoId: string, quality: string = "auto") {
    const supabase = this.getSupabaseClient();

    const { data: video } = await supabase
      .from("video_lessons")
      .select("cloudinary_public_id, hls_url")
      .eq("id", videoId)
      .single();

    if (!video) {
      throw new NotFoundException("Video not found");
    }

    const hlsUrl = this.cloudinaryService.generateHlsUrl(
      video.cloudinary_public_id,
    );
    const spriteUrl = await this.cloudinaryService.generateSpriteSheet(
      video.cloudinary_public_id,
    );

    return {
      hls: hlsUrl,
      mp4: video.hls_url?.replace(".m3u8", ".mp4"),
      sprite: spriteUrl,
      poster: this.cloudinaryService.generateThumbnailUrl(
        video.cloudinary_public_id,
        { time: 0 },
      ),
    };
  }

  // ==================== WATCH PROGRESS ====================

  async trackWatchProgress(trackDto: TrackWatchProgressDto) {
    const supabase = this.getSupabaseClient();

    const { data: video } = await supabase
      .from("video_lessons")
      .select("lesson_id, video_duration")
      .eq("id", trackDto.video_id)
      .single();

    if (!video) {
      throw new NotFoundException("Video not found");
    }

    const completed =
      trackDto.completed ||
      trackDto.watch_time >= (video.video_duration || 0) * 0.9;

    const { data, error } = await supabase
      .from("video_watch_history")
      .upsert({
        user_id: trackDto.user_id,
        video_id: trackDto.video_id,
        lesson_id: video.lesson_id,
        watch_time: trackDto.watch_time,
        last_position: trackDto.last_position,
        completed: completed,
        completed_at: completed ? new Date() : null,
        last_updated_at: new Date(),
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Failed to track progress: ${error.message}`,
      );
    }

    await this.updateVideoAnalytics(trackDto.video_id);

    return { success: true, progress: data, completed };
  }

  async getUserProgress(userId: string, videoId: string) {
    const supabase = this.getSupabaseClient();

    const { data, error } = await supabase
      .from("video_watch_history")
      .select("*")
      .eq("user_id", userId)
      .eq("video_id", videoId)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(
        `Failed to fetch progress: ${error.message}`,
      );
    }

    return data || { watch_time: 0, last_position: 0, completed: false };
  }

  private async trackView(videoId: string, userId?: string) {
    const supabase = this.getSupabaseClient();

    const { data: video } = await supabase
      .from("video_lessons")
      .select("view_count")
      .eq("id", videoId)
      .single();

    await supabase
      .from("video_lessons")
      .update({ view_count: (video?.view_count || 0) + 1 })
      .eq("id", videoId);

    await this.updateVideoAnalytics(videoId);
  }

  private async updateVideoAnalytics(videoId: string) {
    const supabase = this.getSupabaseClient();

    const { data: stats } = await supabase
      .from("video_watch_history")
      .select("user_id, watch_time, completed")
      .eq("video_id", videoId);

    if (!stats || stats.length === 0) return;

    const totalViews = stats.length;
    const uniqueViewers = new Set(stats.map((s) => s.user_id)).size;
    const totalWatchTime = stats.reduce(
      (sum, s) => sum + (s.watch_time || 0),
      0,
    );
    const completedCount = stats.filter((s) => s.completed).length;
    const completionRate =
      totalViews > 0 ? (completedCount / totalViews) * 100 : 0;

    await supabase.from("video_analytics").upsert({
      video_id: videoId,
      total_views: totalViews,
      unique_viewers: uniqueViewers,
      total_watch_time: totalWatchTime,
      average_completion_rate: completionRate,
      updated_at: new Date(),
    });
  }

  // ==================== COMMENTS ====================

  async addComment(commentDto: AddVideoCommentDto) {
    const supabase = this.getSupabaseClient();

    const { data, error } = await supabase
      .from("video_comments")
      .insert({
        video_id: commentDto.video_id,
        user_id: commentDto.user_id,
        comment: commentDto.comment,
        timestamp_seconds: commentDto.timestamp_seconds,
        parent_id: commentDto.parent_id || null,
        created_at: new Date(),
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to add comment: ${error.message}`);
    }

    return data;
  }

  async getComments(videoId: string, limit = 50) {
    const supabase = this.getSupabaseClient();

    const { data, error } = await supabase
      .from("video_comments")
      .select("*")
      .eq("video_id", videoId)
      .is("parent_id", null)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new BadRequestException(
        `Failed to fetch comments: ${error.message}`,
      );
    }

    return data || [];
  }

  async likeComment(commentId: string, userId: string) {
    const supabase = this.getSupabaseClient();

    const { data: comment } = await supabase
      .from("video_comments")
      .select("likes_count")
      .eq("id", commentId)
      .single();

    const { error } = await supabase
      .from("video_comments")
      .update({ likes_count: (comment?.likes_count || 0) + 1 })
      .eq("id", commentId);

    if (error) {
      throw new BadRequestException(`Failed to like comment: ${error.message}`);
    }

    return { success: true, message: "Comment liked" };
  }
}
