// src/courses/courses.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  // ==================== COURSE MANAGEMENT ====================

  async createCourse(instructorId: string, createCourseDto: any) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from("courses")
      .insert({
        ...createCourseDto,
        instructor_id: instructorId,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .select()
      .single();

    if (error) {
      this.logger.error(`Failed to create course: ${error.message}`);
      throw new BadRequestException(
        `Failed to create course: ${error.message}`,
      );
    }

    return data;
  }

  async getAllCourses(filters?: {
    category?: string;
    level?: string;
    search?: string;
  }) {
    const supabase = this.supabaseService.getClient();

    let query = supabase
      .from("courses")
      .select(
        `
        *,
        instructor:instructor_id(id, full_name, email)
      `,
      )
      .eq("status", "PUBLISHED");

    if (filters?.category) {
      query = query.eq("category", filters.category);
    }
    if (filters?.level) {
      query = query.eq("level", filters.level);
    }
    if (filters?.search) {
      query = query.ilike("title", `%${filters.search}%`);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      this.logger.error(`Failed to fetch courses: ${error.message}`);
      throw new BadRequestException(
        `Failed to fetch courses: ${error.message}`,
      );
    }

    return data || [];
  }

  async getCourseById(courseId: string) {
    const supabase = this.supabaseService.getClient();

    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select(
        `
        *,
        instructor:instructor_id(id, full_name, email, about_me)
      `,
      )
      .eq("id", courseId)
      .single();

    if (courseError || !course) {
      throw new NotFoundException("Course not found");
    }

    const { data: modules } = await supabase
      .from("course_modules")
      .select(
        `
        *,
        lessons:course_lessons(*)
      `,
      )
      .eq("course_id", courseId)
      .order("order_number", { ascending: true });

    const allLessons = modules?.flatMap((m) => m.lessons) || [];
    const totalLessons = allLessons.length;
    const totalDuration = allLessons.reduce(
      (sum, lesson) => sum + (lesson.video_duration || 0),
      0,
    );

    const { data: reviews } = await supabase
      .from("course_reviews")
      .select("rating")
      .eq("course_id", courseId);

    const averageRating = reviews?.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return {
      ...course,
      modules: modules || [],
      stats: {
        totalLessons,
        totalDuration,
        totalReviews: reviews?.length || 0,
        averageRating: Math.round(averageRating * 10) / 10,
      },
    };
  }

  async updateCourse(
    courseId: string,
    instructorId: string,
    updateCourseDto: any,
  ) {
    const supabase = this.supabaseService.getClient();

    const { data: existingCourse, error: findError } = await supabase
      .from("courses")
      .select("id")
      .eq("id", courseId)
      .eq("instructor_id", instructorId)
      .single();

    if (findError || !existingCourse) {
      throw new NotFoundException(
        "Course not found or you do not have permission",
      );
    }

    const { data, error } = await supabase
      .from("courses")
      .update({
        ...updateCourseDto,
        updated_at: new Date(),
        published_at: updateCourseDto.is_published ? new Date() : undefined,
      })
      .eq("id", courseId)
      .select()
      .single();

    if (error) {
      this.logger.error(`Failed to update course: ${error.message}`);
      throw new BadRequestException(
        `Failed to update course: ${error.message}`,
      );
    }

    return data;
  }

  async deleteCourse(courseId: string, instructorId: string) {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", courseId)
      .eq("instructor_id", instructorId);

    if (error) {
      this.logger.error(`Failed to delete course: ${error.message}`);
      throw new BadRequestException(
        `Failed to delete course: ${error.message}`,
      );
    }

    return { message: "Course deleted successfully" };
  }

  async getInstructorCourses(instructorId: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("instructor_id", instructorId)
      .order("created_at", { ascending: false });

    if (error) {
      this.logger.error(`Failed to fetch instructor courses: ${error.message}`);
      throw new BadRequestException(
        `Failed to fetch instructor courses: ${error.message}`,
      );
    }

    return data || [];
  }

  // ==================== MODULE MANAGEMENT ====================

  async addModule(
    courseId: string,
    instructorId: string,
    createModuleDto: any,
  ) {
    const supabase = this.supabaseService.getClient();

    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id")
      .eq("id", courseId)
      .eq("instructor_id", instructorId)
      .single();

    if (courseError || !course) {
      throw new NotFoundException(
        "Course not found or you do not have permission",
      );
    }

    const { data, error } = await supabase
      .from("course_modules")
      .insert({
        ...createModuleDto,
        course_id: courseId,
      })
      .select()
      .single();

    if (error) {
      this.logger.error(`Failed to add module: ${error.message}`);
      throw new BadRequestException(`Failed to add module: ${error.message}`);
    }

    return data;
  }

  async updateModule(moduleId: string, instructorId: string, updateData: any) {
    const supabase = this.supabaseService.getClient();

    const { data: module, error: moduleError } = await supabase
      .from("course_modules")
      .select("course_id")
      .eq("id", moduleId)
      .single();

    if (moduleError || !module) {
      throw new NotFoundException("Module not found");
    }

    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("instructor_id")
      .eq("id", module.course_id)
      .single();

    if (courseError || !course || course.instructor_id !== instructorId) {
      throw new ForbiddenException(
        "You do not have permission to modify this module",
      );
    }

    const { data, error } = await supabase
      .from("course_modules")
      .update(updateData)
      .eq("id", moduleId)
      .select()
      .single();

    if (error) {
      this.logger.error(`Failed to update module: ${error.message}`);
      throw new BadRequestException(
        `Failed to update module: ${error.message}`,
      );
    }

    return data;
  }

  async deleteModule(moduleId: string, instructorId: string) {
    const supabase = this.supabaseService.getClient();

    const { data: module, error: moduleError } = await supabase
      .from("course_modules")
      .select("course_id")
      .eq("id", moduleId)
      .single();

    if (moduleError || !module) {
      throw new NotFoundException("Module not found");
    }

    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("instructor_id")
      .eq("id", module.course_id)
      .single();

    if (courseError || !course || course.instructor_id !== instructorId) {
      throw new ForbiddenException(
        "You do not have permission to delete this module",
      );
    }

    const { error } = await supabase
      .from("course_modules")
      .delete()
      .eq("id", moduleId);

    if (error) {
      this.logger.error(`Failed to delete module: ${error.message}`);
      throw new BadRequestException(
        `Failed to delete module: ${error.message}`,
      );
    }

    return { message: "Module deleted successfully" };
  }

  // ==================== LESSON MANAGEMENT ====================

  async addLesson(
    moduleId: string,
    instructorId: string,
    createLessonDto: any,
  ) {
    const supabase = this.supabaseService.getClient();

    const { data: module, error: moduleError } = await supabase
      .from("course_modules")
      .select("course_id")
      .eq("id", moduleId)
      .single();

    if (moduleError || !module) {
      throw new NotFoundException("Module not found");
    }

    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("instructor_id")
      .eq("id", module.course_id)
      .single();

    if (courseError || !course || course.instructor_id !== instructorId) {
      throw new ForbiddenException(
        "You do not have permission to add lessons to this module",
      );
    }

    const { data, error } = await supabase
      .from("course_lessons")
      .insert({
        ...createLessonDto,
        module_id: moduleId,
      })
      .select()
      .single();

    if (error) {
      this.logger.error(`Failed to add lesson: ${error.message}`);
      throw new BadRequestException(`Failed to add lesson: ${error.message}`);
    }

    return data;
  }

  async updateLesson(lessonId: string, instructorId: string, updateData: any) {
    const supabase = this.supabaseService.getClient();

    const { data: lesson, error: lessonError } = await supabase
      .from("course_lessons")
      .select("module:course_modules(course_id)")
      .eq("id", lessonId)
      .single();

    if (lessonError || !lesson) {
      throw new NotFoundException("Lesson not found");
    }

    const courseId = (lesson.module as any)?.course_id;
    if (!courseId) {
      throw new NotFoundException("Course not found for this lesson");
    }

    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("instructor_id")
      .eq("id", courseId)
      .single();

    if (courseError || !course || course.instructor_id !== instructorId) {
      throw new ForbiddenException(
        "You do not have permission to modify this lesson",
      );
    }

    const { data, error } = await supabase
      .from("course_lessons")
      .update(updateData)
      .eq("id", lessonId)
      .select()
      .single();

    if (error) {
      this.logger.error(`Failed to update lesson: ${error.message}`);
      throw new BadRequestException(
        `Failed to update lesson: ${error.message}`,
      );
    }

    return data;
  }

  async deleteLesson(lessonId: string, instructorId: string) {
    const supabase = this.supabaseService.getClient();

    const { data: lesson, error: lessonError } = await supabase
      .from("course_lessons")
      .select("module:course_modules(course_id)")
      .eq("id", lessonId)
      .single();

    if (lessonError || !lesson) {
      throw new NotFoundException("Lesson not found");
    }

    const courseId = (lesson.module as any)?.course_id;
    if (!courseId) {
      throw new NotFoundException("Course not found for this lesson");
    }

    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("instructor_id")
      .eq("id", courseId)
      .single();

    if (courseError || !course || course.instructor_id !== instructorId) {
      throw new ForbiddenException(
        "You do not have permission to delete this lesson",
      );
    }

    const { error } = await supabase
      .from("course_lessons")
      .delete()
      .eq("id", lessonId);

    if (error) {
      this.logger.error(`Failed to delete lesson: ${error.message}`);
      throw new BadRequestException(
        `Failed to delete lesson: ${error.message}`,
      );
    }

    return { message: "Lesson deleted successfully" };
  }

  // ==================== ENROLLMENT & PROGRESS ====================

  async enrollInCourse(userId: string, courseId: string) {
    const supabase = this.supabaseService.getClient();

    const { data: existing } = await supabase
      .from("course_enrollments")
      .select("id")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .maybeSingle();

    if (existing) {
      throw new BadRequestException("Already enrolled in this course");
    }

    const { data: course } = await supabase
      .from("courses")
      .select("id, status")
      .eq("id", courseId)
      .single();

    if (!course || course.status !== "PUBLISHED") {
      throw new BadRequestException("Course is not available for enrollment");
    }

    const { data, error } = await supabase
      .from("course_enrollments")
      .insert({
        user_id: userId,
        course_id: courseId,
        enrollment_date: new Date(),
        progress_percentage: 0,
      })
      .select()
      .single();

    if (error) {
      this.logger.error(`Failed to enroll: ${error.message}`);
      throw new BadRequestException(`Failed to enroll: ${error.message}`);
    }

    return data;
  }

  async getUserEnrollments(userId: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from("course_enrollments")
      .select(
        `
        *,
        course:courses(*)
      `,
      )
      .eq("user_id", userId)
      .order("enrollment_date", { ascending: false });

    if (error) {
      this.logger.error(`Failed to fetch enrollments: ${error.message}`);
      throw new BadRequestException(
        `Failed to fetch enrollments: ${error.message}`,
      );
    }

    return data || [];
  }

  async getCourseProgress(userId: string, courseId: string) {
    const supabase = this.supabaseService.getClient();

    // Get enrollment
    const { data: enrollment, error: enrollmentError } = await supabase
      .from("course_enrollments")
      .select("*")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .single();

    if (enrollmentError || !enrollment) {
      throw new NotFoundException("Enrollment not found");
    }

    // Get all modules for this course
    const { data: modules, error: modulesError } = await supabase
      .from("course_modules")
      .select("*")
      .eq("course_id", courseId)
      .order("order_number", { ascending: true });

    if (modulesError) {
      throw new BadRequestException(
        `Failed to fetch modules: ${modulesError.message}`,
      );
    }

    // Get all lessons for this course
    const moduleIds = modules?.map((m) => m.id) || [];
    const { data: lessons, error: lessonsError } = await supabase
      .from("course_lessons")
      .select("*")
      .in("module_id", moduleIds)
      .order("order_number", { ascending: true });

    if (lessonsError) {
      throw new BadRequestException(
        `Failed to fetch lessons: ${lessonsError.message}`,
      );
    }

    // Get progress records
    const lessonIds = lessons?.map((l) => l.id) || [];
    const { data: progressRecords } = await supabase
      .from("user_lesson_progress")
      .select("*")
      .eq("user_id", userId)
      .in("lesson_id", lessonIds);

    // Calculate stats
    const totalLessons = lessons?.length || 0;
    const completedLessons =
      progressRecords?.filter((r) => r.is_completed === true).length || 0;
    const progressPercentage =
      totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    // Create a map of lessons by module
    const lessonsByModule = new Map();
    lessons?.forEach((lesson) => {
      const moduleId = lesson.module_id;
      if (!lessonsByModule.has(moduleId)) {
        lessonsByModule.set(moduleId, []);
      }

      const progress = progressRecords?.find((r) => r.lesson_id === lesson.id);

      lessonsByModule.get(moduleId).push({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        order_number: lesson.order_number,
        video_url: lesson.video_url,
        video_duration: lesson.video_duration,
        text_content: lesson.text_content,
        is_free: lesson.is_free,
        is_completed: progress?.is_completed || false,
        completed_at: progress?.completed_at || null,
        last_watched_position: progress?.last_watched_position || 0,
      });
    });

    // Build modules with their lessons
    const modulesWithLessons = modules?.map((module) => ({
      id: module.id,
      title: module.title,
      description: module.description,
      order_number: module.order_number,
      lessons: lessonsByModule.get(module.id) || [],
    }));

    return {
      enrollment: {
        ...enrollment,
        progress_percentage: Math.round(progressPercentage),
      },
      modules: modulesWithLessons || [],
      stats: {
        totalLessons,
        completedLessons,
        progressPercentage: Math.round(progressPercentage),
        remainingLessons: totalLessons - completedLessons,
      },
    };
  }

  async updateLessonProgress(userId: string, progressDto: any) {
    const supabase = this.supabaseService.getClient();

    const { data: existing } = await supabase
      .from("user_lesson_progress")
      .select("id")
      .eq("user_id", userId)
      .eq("lesson_id", progressDto.lesson_id)
      .maybeSingle();

    let result;

    if (existing) {
      const { data, error } = await supabase
        .from("user_lesson_progress")
        .update({
          is_completed: progressDto.is_completed,
          last_watched_position: progressDto.last_watched_position || 0,
          completed_at: progressDto.is_completed ? new Date() : null,
          updated_at: new Date(),
        })
        .eq("id", existing.id)
        .select()
        .single();

      result = { data, error };
    } else {
      const { data, error } = await supabase
        .from("user_lesson_progress")
        .insert({
          user_id: userId,
          lesson_id: progressDto.lesson_id,
          is_completed: progressDto.is_completed,
          last_watched_position: progressDto.last_watched_position || 0,
          completed_at: progressDto.is_completed ? new Date() : null,
        })
        .select()
        .single();

      result = { data, error };
    }

    if (result.error) {
      throw new BadRequestException(
        `Failed to update progress: ${result.error.message}`,
      );
    }

    // Update course progress
    await this.updateCourseProgress(userId, progressDto.lesson_id);

    return result.data;
  }

  private async updateCourseProgress(userId: string, lessonId: string) {
    const supabase = this.supabaseService.getClient();

    // Get module_id from lesson
    const { data: lesson } = await supabase
      .from("course_lessons")
      .select("module_id")
      .eq("id", lessonId)
      .single();

    if (!lesson) return;

    // Get course_id from module
    const { data: module } = await supabase
      .from("course_modules")
      .select("course_id")
      .eq("id", lesson.module_id)
      .single();

    if (!module) return;

    const courseId = module.course_id;

    // Get all lessons for this course
    const { data: allLessons } = await supabase
      .from("course_lessons")
      .select("id")
      .eq("module.course_id", courseId);

    if (!allLessons || allLessons.length === 0) return;

    // Get completed lessons
    const { data: completedLessons } = await supabase
      .from("user_lesson_progress")
      .select("lesson_id")
      .eq("user_id", userId)
      .eq("is_completed", true)
      .in(
        "lesson_id",
        allLessons.map((l) => l.id),
      );

    const totalLessons = allLessons.length;
    const completedCount = completedLessons?.length || 0;
    const progressPercentage = (completedCount / totalLessons) * 100;

    // Update enrollment progress
    await supabase
      .from("course_enrollments")
      .update({
        progress_percentage: progressPercentage,
        completed_at: progressPercentage === 100 ? new Date() : null,
        last_accessed_at: new Date(),
      })
      .eq("user_id", userId)
      .eq("course_id", courseId);
  }

  // ==================== REVIEWS ====================

  async addReview(userId: string, createReviewDto: any) {
    const supabase = this.supabaseService.getClient();

    const { data: enrollment } = await supabase
      .from("course_enrollments")
      .select("id")
      .eq("user_id", userId)
      .eq("course_id", createReviewDto.course_id)
      .single();

    if (!enrollment) {
      throw new BadRequestException(
        "You must be enrolled to review this course",
      );
    }

    const { data: existingReview } = await supabase
      .from("course_reviews")
      .select("id")
      .eq("user_id", userId)
      .eq("course_id", createReviewDto.course_id)
      .maybeSingle();

    if (existingReview) {
      throw new BadRequestException("You have already reviewed this course");
    }

    const { data, error } = await supabase
      .from("course_reviews")
      .insert({
        ...createReviewDto,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      this.logger.error(`Failed to add review: ${error.message}`);
      throw new BadRequestException(`Failed to add review: ${error.message}`);
    }

    return data;
  }

  async getCourseReviews(courseId: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from("course_reviews")
      .select(
        `
        *,
        user:user_id(id, full_name, profile_picture)
      `,
      )
      .eq("course_id", courseId)
      .order("created_at", { ascending: false });

    if (error) {
      this.logger.error(`Failed to fetch reviews: ${error.message}`);
      throw new BadRequestException(
        `Failed to fetch reviews: ${error.message}`,
      );
    }

    const distribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    data?.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating as keyof typeof distribution]++;
      }
    });

    return {
      reviews: data || [],
      total: data?.length || 0,
      distribution,
    };
  }
}
