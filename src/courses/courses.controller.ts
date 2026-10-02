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
  Req,
  Patch,
} from "@nestjs/common";
import { CoursesService } from "./courses.service";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";
import { CreateModuleDto } from "./dto/create-module.dto";
import { CreateLessonDto } from "./dto/create-lesson.dto";
import { LessonProgressDto } from "./dto/lesson-progress.dto";
import { CreateReviewDto } from "./dto/create-review.dto";
import { EnrollCourseDto } from "./dto/enroll-course.dto";
@Controller("api/courses")
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // ==================== PUBLIC ROUTES ====================

  @Get()
  async getAllCourses(
    @Query("category") category?: string,
    @Query("level") level?: string,
    @Query("search") search?: string,
  ) {
    return this.coursesService.getAllCourses({ category, level, search });
  }

  @Get(":id")
  async getCourseById(@Param("id") id: string) {
    return this.coursesService.getCourseById(id);
  }

  @Get(":id/reviews")
  async getCourseReviews(@Param("id") id: string) {
    return this.coursesService.getCourseReviews(id);
  }

  // ==================== INSTRUCTOR ROUTES ====================
  // Note: instructorId is passed as a query param or header for now
  // Later you can replace with JWT auth

  @Post()
  async createCourse(
    @Body() createCourseDto: CreateCourseDto,
    @Query("instructorId") instructorId: string,
  ) {
    return this.coursesService.createCourse(instructorId, createCourseDto);
  }

  @Put(":id")
  async updateCourse(
    @Param("id") id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @Query("instructorId") instructorId: string,
  ) {
    return this.coursesService.updateCourse(id, instructorId, updateCourseDto);
  }

  @Delete(":id")
  async deleteCourse(
    @Param("id") id: string,
    @Query("instructorId") instructorId: string,
  ) {
    return this.coursesService.deleteCourse(id, instructorId);
  }

  @Get("instructor/:instructorId/courses")
  async getInstructorCourses(@Param("instructorId") instructorId: string) {
    return this.coursesService.getInstructorCourses(instructorId);
  }

  @Get("instructor/:instructorId/students")
  async getInstructorStudents(@Param("instructorId") instructorId: string) {
    return this.coursesService.getInstructorStudents(instructorId);
  }

  // Module routes
  @Post("courses/:courseId/modules")
  async addModule(
    @Param("courseId") courseId: string,
    @Body() createModuleDto: CreateModuleDto,
    @Query("instructorId") instructorId: string,
  ) {
    return this.coursesService.addModule(
      courseId,
      instructorId,
      createModuleDto,
    );
  }

  @Put("modules/:moduleId")
  async updateModule(
    @Param("moduleId") moduleId: string,
    @Body() updateData: any,
    @Query("instructorId") instructorId: string,
  ) {
    return this.coursesService.updateModule(moduleId, instructorId, updateData);
  }

  @Delete("modules/:moduleId")
  async deleteModule(
    @Param("moduleId") moduleId: string,
    @Query("instructorId") instructorId: string,
  ) {
    return this.coursesService.deleteModule(moduleId, instructorId);
  }

  // Lesson routes
  @Post("modules/:moduleId/lessons")
  async addLesson(
    @Param("moduleId") moduleId: string,
    @Body() createLessonDto: CreateLessonDto,
    @Query("instructorId") instructorId: string,
  ) {
    return this.coursesService.addLesson(
      moduleId,
      instructorId,
      createLessonDto,
    );
  }

  @Put("lessons/:lessonId")
  async updateLesson(
    @Param("lessonId") lessonId: string,
    @Body() updateData: any,
    @Query("instructorId") instructorId: string,
  ) {
    return this.coursesService.updateLesson(lessonId, instructorId, updateData);
  }

  @Delete("lessons/:lessonId")
  async deleteLesson(
    @Param("lessonId") lessonId: string,
    @Query("instructorId") instructorId: string,
  ) {
    return this.coursesService.deleteLesson(lessonId, instructorId);
  }

  // ==================== STUDENT ROUTES ====================
  // Note: userId is passed as a query param for now

  @Post("enroll")
  async enrollCourse(
    @Body() enrollDto: EnrollCourseDto,
    @Query("userId") userId: string,
  ) {
    return this.coursesService.enrollInCourse(userId, enrollDto.course_id);
  }

  @Get("users/:userId/enrollments")
  async getUserEnrollments(@Param("userId") userId: string) {
    return this.coursesService.getUserEnrollments(userId);
  }

  @Get("users/:userId/courses/:courseId/progress")
  async getCourseProgress(
    @Param("userId") userId: string,
    @Param("courseId") courseId: string,
  ) {
    return this.coursesService.getCourseProgress(userId, courseId);
  }

  @Get("instructor/:instructorId/recent-enrollments")
  async getRecentEnrollments(
    @Param("instructorId") instructorId: string,
    @Query("limit") limit?: string,
  ) {
    return this.coursesService.getRecentEnrollments(
      instructorId,
      limit ? Number(limit) : 5,
    );
  }

  

  @Patch("progress")
  async updateProgress(
    @Body() progressDto: LessonProgressDto,
    @Query("userId") userId: string,
  ) {
    return this.coursesService.updateLessonProgress(userId, progressDto);
  }

  // Reviews
  @Post("reviews")
  async addReview(
    @Body() createReviewDto: CreateReviewDto,
    @Query("userId") userId: string,
  ) {
    return this.coursesService.addReview(userId, createReviewDto);
  }
}
