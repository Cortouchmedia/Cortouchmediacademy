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
    return role === "ADMIN" || role === "SUPERADMIN" || role === "SUPER_ADMIN";
  }

 /**
 * Multipart form-data sends everything as strings, so coerce
 * `attachments`, `is_free`, `order_number`, `video_duration`.
 * Also accepts "mm:ss" / "hh:mm:ss" for video_duration so legacy
 * clients (or a stray EditCourse.tsx that hasn't been updated) still work.
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


if (out.video_duration !== undefined && out.video_duration !== null) {
  out.video_duration = this.parseDurationToMinutes(out.video_duration);


  if (
    out.video_duration !== undefined &&
    (out.video_duration < 0 || out.video_duration > 24 * 60)
  ) {
    throw new BadRequestException(
      "video_duration must be between 0 and 1440 minutes (24 hours)",
    );
  }
}

  return out;
}

/**
 * Accepts:
 *   "1:15"     → 1.25   (mm:ss)
 *   "1:02:30"  → 62.5   (hh:mm:ss)
 *   "1.25"     → 1.25   (already decimal)
 *   1.25       → 1.25   (number)
 *   ""         → undefined (field omitted)
 * Garbage → throws 400 (we don't silently coerce to 0).
 */
private parseDurationToMinutes(input: string | number): number | undefined {
  if (input === "" || input === null || input === undefined) {
    return undefined;
  }

  if (typeof input === "number") {
    if (!Number.isFinite(input) || input < 0) {
      throw new BadRequestException(
        `Invalid video_duration: ${input}`,
      );
    }
    return input;
  }

  const str = String(input).trim();

  // plain decimal like "1.25"
  if (/^\d+(\.\d+)?$/.test(str)) {
    return Number(str);
  }

  // "mm:ss" or "hh:mm:ss"
  const parts = str.split(":").map((p) => Number(p));
  if (parts.some((p) => Number.isNaN(p) || p < 0)) {
    throw new BadRequestException(
      `Invalid video_duration: "${input}". Use decimal minutes or mm:ss.`,
    );
  }

  if (parts.length === 2) {
  
    if (parts[1] >= 60) {
      throw new BadRequestException(
        `Invalid video_duration: "${input}". Seconds must be < 60.`,
      );
    }
    return parts[0] + parts[1] / 60;
  }
  if (parts.length === 3) {
   
    if (parts[1] >= 60 || parts[2] >= 60) {
      throw new BadRequestException(
        `Invalid video_duration: "${input}". Minutes and seconds must be < 60.`,
      );
    }
    return parts[0] * 60 + parts[1] + parts[2] / 60;
  }

  throw new BadRequestException(
    `Invalid video_duration: "${input}". Use decimal minutes or mm:ss.`,
  );
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

  // ==================== INSTRUCTOR / ADMIN COURSE ROUTES ====================
  // (declared BEFORE ':id' so they don't get swallowed by the param route)

  @Post()
  @UseGuards(SupabaseAuthGuard)
  async createCourse(
    @Body() createCourseDto: CreateCourseDto,
    @CurrentUser() user: AuthUser,
  ) {
    const role = (user.role ?? "").toUpperCase();
    if (!this.isAdmin(user) && role !== "INSTRUCTOR") {
      throw new ForbiddenException(
        "Only instructors or admins can create courses",
      );
    }
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
  @UseGuards(SupabaseAuthGuard)
  async deleteCourse(
    @Param("id") id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const isAdmin = this.isAdmin(user);
    const role = (user.role ?? "").toUpperCase();
    if (!isAdmin && role !== "INSTRUCTOR") {
      throw new ForbiddenException(
        "Only instructors or admins can delete courses",
      );
    }
    return this.coursesService.deleteCourse(id, user.id, isAdmin);
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

  @Post("upload-signature")
  @UseGuards(SupabaseAuthGuard)
  async getUploadSignature(@CurrentUser() user: AuthUser) {
    const role = (user.role ?? "").toUpperCase();
    if (!this.isAdmin(user) && role !== "INSTRUCTOR") {
      throw new ForbiddenException("Only instructors or admins can upload");
    }
    return this.coursesService.generateUploadSignature();
  }

  // ==================== INSTRUCTOR-SCOPED READ ROUTES ====================

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

  // ==================== MODULE ROUTES ====================
  // NOTE: these are absolute paths relative to "api/courses", so the full
  // URLs are /api/courses/:courseId/modules and /api/courses/modules/:moduleId

  @Post(":courseId/modules")
  @UseGuards(SupabaseAuthGuard)
  async addModule(
    @Param("courseId") courseId: string,
    @Body() createModuleDto: CreateModuleDto,
    @CurrentUser() user: AuthUser,
  ) {
    const isAdmin = this.isAdmin(user);
    const role = (user.role ?? "").toUpperCase();
    if (!isAdmin && role !== "INSTRUCTOR") {
      throw new ForbiddenException(
        "Only instructors or admins can add modules",
      );
    }
    return this.coursesService.addModule(
      courseId,
      user.id,
      createModuleDto,
      isAdmin,
    );
  }

  @Put("modules/:moduleId")
  @UseGuards(SupabaseAuthGuard)
  async updateModule(
    @Param("moduleId") moduleId: string,
    @Body() updateData: any,
    @CurrentUser() user: AuthUser,
  ) {
    const isAdmin = this.isAdmin(user);
    const role = (user.role ?? "").toUpperCase();
    if (!isAdmin && role !== "INSTRUCTOR") {
      throw new ForbiddenException(
        "Only instructors or admins can update modules",
      );
    }
    return this.coursesService.updateModule(
      moduleId,
      user.id,
      updateData,
      isAdmin,
    );
  }

  @Delete("modules/:moduleId")
  @UseGuards(SupabaseAuthGuard)
  async deleteModule(
    @Param("moduleId") moduleId: string,
    @CurrentUser() user: AuthUser,
  ) {
    const isAdmin = this.isAdmin(user);
    const role = (user.role ?? "").toUpperCase();
    if (!isAdmin && role !== "INSTRUCTOR") {
      throw new ForbiddenException(
        "Only instructors or admins can delete modules",
      );
    }
    return this.coursesService.deleteModule(moduleId, user.id, isAdmin);
  }

  // ==================== LESSON ROUTES (with file uploads) ====================

  @Post("modules/:moduleId/lessons")
  @UseGuards(SupabaseAuthGuard)
  @UseInterceptors(FilesInterceptor("files", 10))
  async addLesson(
    @Param("moduleId") moduleId: string,
    @Body() body: any,
    @UploadedFiles() files: MulterFile[],
    @CurrentUser() user: AuthUser,
  ) {
    const isAdmin = this.isAdmin(user);
    const role = (user.role ?? "").toUpperCase();
    if (!isAdmin && role !== "INSTRUCTOR") {
      throw new ForbiddenException(
        "Only instructors or admins can add lessons",
      );
    }
    return this.coursesService.addLesson(
      moduleId,
      user.id,
      this.normalizeLessonBody(body),
      files,
      isAdmin,
    );
  }

  @Put("lessons/:lessonId")
  @UseGuards(SupabaseAuthGuard)
  @UseInterceptors(FilesInterceptor("files", 10))
  async updateLesson(
    @Param("lessonId") lessonId: string,
    @Body() body: any,
    @UploadedFiles() files: MulterFile[],
    @CurrentUser() user: AuthUser,
  ) {
    const isAdmin = this.isAdmin(user);
    const role = (user.role ?? "").toUpperCase();
    if (!isAdmin && role !== "INSTRUCTOR") {
      throw new ForbiddenException(
        "Only instructors or admins can update lessons",
      );
    }
    return this.coursesService.updateLesson(
      lessonId,
      user.id,
      this.normalizeLessonBody(body),
      files,
      isAdmin,
    );
  }

  @Delete("lessons/:lessonId")
  @UseGuards(SupabaseAuthGuard)
  async deleteLesson(
    @Param("lessonId") lessonId: string,
    @CurrentUser() user: AuthUser,
  ) {
    const isAdmin = this.isAdmin(user);
    const role = (user.role ?? "").toUpperCase();
    if (!isAdmin && role !== "INSTRUCTOR") {
      throw new ForbiddenException(
        "Only instructors or admins can delete lessons",
      );
    }
    return this.coursesService.deleteLesson(lessonId, user.id, isAdmin);
  }

  // ==================== LESSON ATTACHMENTS (standalone) ====================

  @Post("lessons/:lessonId/attachments")
  @UseGuards(SupabaseAuthGuard)
  @UseInterceptors(FilesInterceptor("files", 10))
  async addLessonAttachment(
    @Param("lessonId") lessonId: string,
    @Body() body: { link_filename?: string; link_url?: string },
    @UploadedFiles() files: MulterFile[],
    @CurrentUser() user: AuthUser,
  ) {
    const isAdmin = this.isAdmin(user);
    const role = (user.role ?? "").toUpperCase();
    if (!isAdmin && role !== "INSTRUCTOR") {
      throw new ForbiddenException(
        "Only instructors or admins can modify lessons",
      );
    }

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

    return this.coursesService.addLessonAttachment(
      lessonId,
      user.id,
      { link, files },
      isAdmin,
    );
  }

  @Delete("lessons/:lessonId/attachments")
async removeLessonAttachment(
  @Param("lessonId") lessonId: string,
  @Query("identifier") identifier: string,
  @CurrentUser() user: AuthUser,
) {
  const isAdmin = this.isAdmin(user);
  const role = (user.role ?? "").toUpperCase();
  if (!isAdmin && role !== "INSTRUCTOR") {
    throw new ForbiddenException(
      "Only instructors or admins can modify lessons",
    );
  }

  if (!identifier || identifier.trim() === "") {
    throw new BadRequestException(
      "identifier query param is required (public_id or url of the attachment)",
    );
  }

  return this.coursesService.removeLessonAttachment(
    lessonId,
    user.id,
    identifier,
    isAdmin,
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

  // ==================== PUBLIC PARAM ROUTES (must be LAST) ====================

  @Get(":id")
  async getCourseById(@Param("id") id: string) {
    return this.coursesService.getCourseById(id);
  }

  @Get(":id/reviews")
  async getCourseReviews(@Param("id") id: string) {
    return this.coursesService.getCourseReviews(id);
  }
}