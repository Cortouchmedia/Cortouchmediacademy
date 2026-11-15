// src/courses/courses.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Patch,
  UseGuards,
  ForbiddenException,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { CoursesService } from "./courses.service";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";
import { CreateModuleDto } from "./dto/create-module.dto";
import { CreateLessonDto } from "./dto/create-lesson.dto";
import { LessonProgressDto } from "./dto/lesson-progress.dto";
import { CreateReviewDto } from "./dto/create-review.dto";
import { EnrollCourseDto } from "./dto/enroll-course.dto";
import { SupabaseAuthGuard } from "../auth/supabase-auth.guard";
import { InstructorGuard } from "../auth/instructor.guard";
import { AdminGuard } from "../auth/admin.guard";
import { CurrentUser } from "../auth/current-user.decorator";

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

type AuthUser = { id: string; email?: string; role?: string };

@Controller("api/courses")
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // 🔥 Helper — case-insensitive admin check
  private isAdmin(user: AuthUser): boolean {
    const role = (user.role ?? "").toUpperCase();
    return role === "ADMIN" || role === "SUPERADMIN";
  }

  /**
   * Multipart form-data sends everything as strings, so coerce
   * `attachments`, `is_free`, `order_number`, `video_duration`.
   */
  private normalizeLessonBody(body: any) {
    const out: any = { ...body };

    if (typeof out.attachments === "string") {
      try {
        out.attachments = JSON.parse(out.attachments);
      } catch {
        out.attachments = [];
      }
    }

    if (typeof out.is_free === "string") {
      out.is_free = out.is_free === "true";
    }
    if (typeof out.order_number === "string") {
      out.order_number = Number(out.order_number);
    }
    if (typeof out.video_duration === "string") {
      out.video_duration = Number(out.video_duration);
    }

    return out;
  }

  // ==================== PUBLIC ROUTES ====================

  @Get()
  async getAllCourses(
    @Query("category") category?: string,
    @Query("level") level?: string,
    @Query("search") search?: string,
    @Query("includeDrafts") includeDrafts?: string,
  ) {
    return this.coursesService.getAllCourses({
      category,
      level,
      search,
      includeDrafts: includeDrafts === "true",
    });
  }

  @Get(":id")
  async getCourseById(@Param("id") id: string) {
    return this.coursesService.getCourseById(id);
  }

  @Get(":id/reviews")
  async getCourseReviews(@Param("id") id: string) {
    return this.coursesService.getCourseReviews(id);
  }

  // ==================== ADMIN APPROVAL ROUTES ====================

  @Put(":id/approve")
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  async approveCourse(@Param("id") id: string) {
    return this.coursesService.approveCourse(id);
  }

  @Put(":id/reject")
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  async rejectCourse(@Param("id") id: string) {
    return this.coursesService.rejectCourse(id);
  }

  // ==================== INSTRUCTOR / ADMIN COURSE ROUTES ====================

  @Post()
  @UseGuards(SupabaseAuthGuard, InstructorGuard)
  async createCourse(
    @Body() createCourseDto: CreateCourseDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.coursesService.createCourse(user.id, createCourseDto);
  }

  @Put(":id")
  @UseGuards(SupabaseAuthGuard)
  async updateCourse(
    @Param("id") id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @CurrentUser() user: AuthUser,
  ) {
    const isAdmin = this.isAdmin(user);
    const role = (user.role ?? "").toUpperCase();
    const isInstructor = role === "INSTRUCTOR";

    if (!isAdmin && !isInstructor) {
      throw new ForbiddenException(
        "Only instructors or admins can update courses",
      );
    }

    return this.coursesService.updateCourse(
      id,
      user.id,
      updateCourseDto,
      isAdmin,
    );
  }

  @Delete(":id")
  @UseGuards(SupabaseAuthGuard, InstructorGuard)
  async deleteCourse(
    @Param("id") id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.coursesService.deleteCourse(id, user.id);
  }

  @Get("instructor/:instructorId/courses")
  @UseGuards(SupabaseAuthGuard)
  async getInstructorCourses(
    @Param("instructorId") instructorId: string,
    @CurrentUser() user: AuthUser,
  ) {
    if (user.id !== instructorId && !this.isAdmin(user)) {
      throw new ForbiddenException("You can only view your own courses");
    }
    return this.coursesService.getInstructorCourses(instructorId);
  }

  @Get("instructor/:instructorId/students")
  @UseGuards(SupabaseAuthGuard)
  async getInstructorStudents(
    @Param("instructorId") instructorId: string,
    @CurrentUser() user: AuthUser,
  ) {
    if (user.id !== instructorId && !this.isAdmin(user)) {
      throw new ForbiddenException("You can only view your own students");
    }
    return this.coursesService.getInstructorStudents(instructorId);
  }

  // Module routes
  @Post("courses/:courseId/modules")
  @UseGuards(SupabaseAuthGuard, InstructorGuard)
  async addModule(
    @Param("courseId") courseId: string,
    @Body() createModuleDto: CreateModuleDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.coursesService.addModule(courseId, user.id, createModuleDto);
  }

  @Put("modules/:moduleId")
  @UseGuards(SupabaseAuthGuard, InstructorGuard)
  async updateModule(
    @Param("moduleId") moduleId: string,
    @Body() updateData: any,
    @CurrentUser() user: AuthUser,
  ) {
    return this.coursesService.updateModule(moduleId, user.id, updateData);
  }

  @Delete("modules/:moduleId")
  @UseGuards(SupabaseAuthGuard, InstructorGuard)
  async deleteModule(
    @Param("moduleId") moduleId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.coursesService.deleteModule(moduleId, user.id);
  }

  // ==================== LESSON ROUTES (with file uploads) ====================

  @Post("modules/:moduleId/lessons")
  @UseGuards(SupabaseAuthGuard, InstructorGuard)
  @UseInterceptors(FilesInterceptor("files", 10))
  async addLesson(
    @Param("moduleId") moduleId: string,
    @Body() body: any,
    @UploadedFiles() files: MulterFile[],
    @CurrentUser() user: AuthUser,
  ) {
    return this.coursesService.addLesson(
      moduleId,
      user.id,
      this.normalizeLessonBody(body),
      files,
    );
  }

  @Put("lessons/:lessonId")
  @UseGuards(SupabaseAuthGuard, InstructorGuard)
  @UseInterceptors(FilesInterceptor("files", 10))
  async updateLesson(
    @Param("lessonId") lessonId: string,
    @Body() body: any,
    @UploadedFiles() files: MulterFile[],
    @CurrentUser() user: AuthUser,
  ) {
    return this.coursesService.updateLesson(
      lessonId,
      user.id,
      this.normalizeLessonBody(body),
      files,
    );
  }

  @Delete("lessons/:lessonId")
  @UseGuards(SupabaseAuthGuard, InstructorGuard)
  async deleteLesson(
    @Param("lessonId") lessonId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.coursesService.deleteLesson(lessonId, user.id);
  }

  // ==================== LESSON ATTACHMENTS (standalone) ====================

  /**
   * Add a link and/or files to an existing lesson.
   * multipart fields:
   *   link_filename, link_url   (optional — for link-only attachments)
   *   files                      (optional — 1..10 files)
   */
  @Post("lessons/:lessonId/attachments")
  @UseGuards(SupabaseAuthGuard, InstructorGuard)
  @UseInterceptors(FilesInterceptor("files", 10))
  async addLessonAttachment(
    @Param("lessonId") lessonId: string,
    @Body() body: { link_filename?: string; link_url?: string },
    @UploadedFiles() files: MulterFile[],
    @CurrentUser() user: AuthUser,
  ) {
    const hasFiles = !!files && files.length > 0;
    const link =
      body?.link_url && body?.link_filename
        ? { filename: body.link_filename, url: body.link_url }
        : undefined;

    if (!link && !hasFiles) {
      throw new BadRequestException(
        "Provide link_filename + link_url, or at least one file",
      );
    }

    return this.coursesService.addLessonAttachment(lessonId, user.id, {
      link,
      files,
    });
  }

  @Delete("lessons/:lessonId/attachments/:identifier")
  @UseGuards(SupabaseAuthGuard, InstructorGuard)
  async removeLessonAttachment(
    @Param("lessonId") lessonId: string,
    @Param("identifier") identifier: string,
    @CurrentUser() user: AuthUser,
  ) {
    // identifier can be a Cloudinary public_id (contains slashes) or a URL.
    return this.coursesService.removeLessonAttachment(
      lessonId,
      user.id,
      decodeURIComponent(identifier),
    );
  }

  // ==================== STUDENT ROUTES ====================

  @Post("enroll")
  @UseGuards(SupabaseAuthGuard)
  async enrollCourse(
    @Body() enrollDto: EnrollCourseDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.coursesService.enrollInCourse(user.id, enrollDto.course_id);
  }

  @Get("users/:userId/enrollments")
  @UseGuards(SupabaseAuthGuard)
  async getUserEnrollments(
    @Param("userId") userId: string,
    @CurrentUser() user: AuthUser,
  ) {
    if (user.id !== userId && !this.isAdmin(user)) {
      throw new ForbiddenException("You can only view your own enrollments");
    }
    return this.coursesService.getUserEnrollments(userId);
  }

  @Get("users/:userId/courses/:courseId/progress")
  @UseGuards(SupabaseAuthGuard)
  async getCourseProgress(
    @Param("userId") userId: string,
    @Param("courseId") courseId: string,
    @CurrentUser() user: AuthUser,
  ) {
    if (user.id !== userId && !this.isAdmin(user)) {
      throw new ForbiddenException("You can only view your own progress");
    }
    return this.coursesService.getCourseProgress(userId, courseId);
  }

  @Get("instructor/:instructorId/recent-enrollments")
  @UseGuards(SupabaseAuthGuard)
  async getRecentEnrollments(
    @Param("instructorId") instructorId: string,
    @Query("limit") limit: string | undefined,
    @CurrentUser() user: AuthUser,
  ) {
    if (user.id !== instructorId && !this.isAdmin(user)) {
      throw new ForbiddenException("You can only view your own enrollments");
    }
    return this.coursesService.getRecentEnrollments(
      instructorId,
      limit ? Number(limit) : 5,
    );
  }

  @Patch("progress")
  @UseGuards(SupabaseAuthGuard)
  async updateProgress(
    @Body() progressDto: LessonProgressDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.coursesService.updateLessonProgress(user.id, progressDto);
  }

  @Post("reviews")
  @UseGuards(SupabaseAuthGuard)
  async addReview(
    @Body() createReviewDto: CreateReviewDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.coursesService.addReview(user.id, createReviewDto);
  }
}