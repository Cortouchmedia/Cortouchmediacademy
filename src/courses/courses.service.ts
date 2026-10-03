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
    const supabase = this.supabaseService.getAdminClient();

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
    const supabase = this.supabaseService.getAdminClient();
  
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
  
    const { data: courses, error } = await query.order("created_at", {
      ascending: false,
    });
  
    if (error) {
      this.logger.error(`Failed to fetch courses: ${error.message}`);
      throw new BadRequestException(
        `Failed to fetch courses: ${error.message}`,
      );
    }
  
    if (!courses || courses.length === 0) return [];
  
    const courseIds = courses.map((c: any) => c.id);
  

    const { data: modules, error: modulesError } = await supabase
      .from("course_modules")
      .select(
        `
        *,
        lessons:course_lessons(*)
      `,
      )
      .in("course_id", courseIds)
      .order("order_number", { ascending: true });
  
    if (modulesError) {
      this.logger.error(`Failed to fetch modules: ${modulesError.message}`);
      throw new BadRequestException(
        `Failed to fetch modules: ${modulesError.message}`,
      );
    }
  

    const modulesByCourse = new Map<string, any[]>();
    (modules || []).forEach((m: any) => {
      if (!modulesByCourse.has(m.course_id)) {
        modulesByCourse.set(m.course_id, []);
      }
      modulesByCourse.get(m.course_id)!.push(m);
    });
  

        // Count enrollments per course
        const { data: enrollments } = await supabase
        .from("course_enrollments")
        .select("course_id")
        .in("course_id", courseIds);
  
      const enrollmentCountByCourse = new Map<string, number>();
      (enrollments || []).forEach((e: any) => {
        enrollmentCountByCourse.set(
          e.course_id,
          (enrollmentCountByCourse.get(e.course_id) ?? 0) + 1,
        );
      });
  
      // Average rating per course
      const { data: reviews } = await supabase
        .from("course_reviews")
        .select("course_id, rating")
        .in("course_id", courseIds);
  
      const ratingSumByCourse = new Map<string, number>();
      const ratingCountByCourse = new Map<string, number>();
      (reviews || []).forEach((r: any) => {
        ratingSumByCourse.set(
          r.course_id,
          (ratingSumByCourse.get(r.course_id) ?? 0) + Number(r.rating || 0),
        );
        ratingCountByCourse.set(
          r.course_id,
          (ratingCountByCourse.get(r.course_id) ?? 0) + 1,
        );
      });
  
            // Fetch projects for all courses
            const { data: allProjects } = await supabase
            .from("projects")
            .select("*")
            .in("course_id", courseIds);
    
          const projectsByCourse = new Map<string, any[]>();
          (allProjects || []).forEach((p: any) => {
            if (!projectsByCourse.has(p.course_id)) {
              projectsByCourse.set(p.course_id, []);
            }
            projectsByCourse.get(p.course_id)!.push(p);
          });
    
          return courses.map((c: any) => {
            const count = ratingCountByCourse.get(c.id) ?? 0;
            const sum = ratingSumByCourse.get(c.id) ?? 0;
            return {
              ...c,
              content: modulesByCourse.get(c.id) ?? [],
              projects: projectsByCourse.get(c.id) ?? [],
              enrollment_count: enrollmentCountByCourse.get(c.id) ?? 0,
              average_rating: count > 0 ? Math.round((sum / count) * 10) / 10 : 0,
            };
          });
  }

  async getCourseById(courseId: string) {
    const supabase = this.supabaseService.getAdminClient();

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

        // Count enrollments
        const { data: enrollmentRows } = await supabase
        .from("course_enrollments")
        .select("id")
        .eq("course_id", courseId);
  
      const enrollmentCount = enrollmentRows?.length ?? 0;
  
      // Fetch projects for this course
      const { data: projects } = await supabase
        .from("projects")
        .select("*")
        .eq("course_id", courseId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
  
      return {
        ...course,
        modules: modules || [],
        projects: projects || [],
        enrollment_count: enrollmentCount,
        average_rating: Math.round(averageRating * 10) / 10,
        stats: {
          totalLessons,
          totalDuration,
          totalReviews: reviews?.length || 0,
          averageRating: Math.round(averageRating * 10) / 10,
          totalEnrollments: enrollmentCount,
        },
      };
  }

  async updateCourse(
    courseId: string,
    instructorId: string,
    updateCourseDto: any,
  ) {
    const supabase = this.supabaseService.getAdminClient();

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
    const supabase = this.supabaseService.getAdminClient();

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
  const supabase = this.supabaseService.getAdminClient();

  // 1. Fetch instructor's courses
  const { data: courses, error } = await supabase
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

  if (!courses || courses.length === 0) return [];

  const courseIds = courses.map((c) => c.id);

     // Count enrollments per course
     const { data: enrollments } = await supabase
     .from("course_enrollments")
     .select("course_id")
     .in("course_id", courseIds);

   const enrollmentCountByCourse = new Map<string, number>();
   (enrollments || []).forEach((e: any) => {
     enrollmentCountByCourse.set(
       e.course_id,
       (enrollmentCountByCourse.get(e.course_id) ?? 0) + 1,
     );
   });

        // Average rating per course
        const { data: reviews } = await supabase
        .from("course_reviews")
        .select("course_id, rating")
        .in("course_id", courseIds);
  
      const ratingSumByCourse = new Map<string, number>();
      const ratingCountByCourse = new Map<string, number>();
      (reviews || []).forEach((r: any) => {
        ratingSumByCourse.set(
          r.course_id,
          (ratingSumByCourse.get(r.course_id) ?? 0) + Number(r.rating || 0),
        );
        ratingCountByCourse.set(
          r.course_id,
          (ratingCountByCourse.get(r.course_id) ?? 0) + 1,
        );
      });

      // Fetch projects for all courses
      const { data: allProjects } = await supabase
        .from("projects")
        .select("*")
        .in("course_id", courseIds);

      const projectsByCourse = new Map<string, any[]>();
      (allProjects || []).forEach((p: any) => {
        if (!projectsByCourse.has(p.course_id)) {
          projectsByCourse.set(p.course_id, []);
        }
        projectsByCourse.get(p.course_id)!.push(p);
      });
  
      return courses.map((c: any) => {
        const count = ratingCountByCourse.get(c.id) ?? 0;
        const sum = ratingSumByCourse.get(c.id) ?? 0;
        return {
          ...c,
          projects: projectsByCourse.get(c.id) ?? [],
          enrollment_count: enrollmentCountByCourse.get(c.id) ?? 0,
          average_rating: count > 0 ? Math.round((sum / count) * 10) / 10 : 0,
        };
      });
  }

  // ==================== MODULE MANAGEMENT ====================

  async addModule(
    courseId: string,
    instructorId: string,
    createModuleDto: any,
  ) {
    const supabase = this.supabaseService.getAdminClient();

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
    const supabase = this.supabaseService.getAdminClient();

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
    const supabase = this.supabaseService.getAdminClient();

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
    const supabase = this.supabaseService.getAdminClient();

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
    const supabase = this.supabaseService.getAdminClient();

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
    const supabase = this.supabaseService.getAdminClient();

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
    const supabase = this.supabaseService.getAdminClient();

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
    const supabase = this.supabaseService.getAdminClient();
  
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
  
    // Normalize so the frontend always sees a consistent shape
    return (data || []).map((e: any) => ({
      ...e,
      progress_percentage: Math.round(Number(e.progress_percentage) || 0),
      is_completed:
        Number(e.progress_percentage) >= 100 || !!e.completed_at,
    }));
  }

  async getCourseProgress(userId: string, courseId: string) {
    const supabase = this.supabaseService.getAdminClient();

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
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

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
    const supabase = this.supabaseService.getAdminClient();

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
    const supabase = this.supabaseService.getAdminClient();
  
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
  
    const { data: courseModules } = await supabase
      .from("course_modules")
      .select("id")
      .eq("course_id", courseId);
  
    if (!courseModules || courseModules.length === 0) return;
  
    const moduleIds = courseModules.map((m) => m.id);
  
    const { data: allLessons } = await supabase
      .from("course_lessons")
      .select("id")
      .in("module_id", moduleIds);
  
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
  
    // ✅ FIX 1: Round to integer to avoid float precision (99.99999 -> 100)
    const progressPercentage = Math.round(
      (completedCount / totalLessons) * 100,
    );
  
    // ✅ FIX 2: Use >= 100 instead of === 100 to be tolerant of edge cases
    const isCompleted = progressPercentage >= 100;
  
    // ✅ FIX 3: Fetch existing enrollment so we don't wipe completed_at
    const { data: existingEnrollment } = await supabase
      .from("course_enrollments")
      .select("id, completed_at")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .maybeSingle();
  
    if (!existingEnrollment) {
      this.logger.warn(
        `No enrollment found for user ${userId} in course ${courseId}`,
      );
      return;
    }
  
    // ✅ FIX 4: Preserve the original completed_at if it already exists
    const completedAt = isCompleted
      ? existingEnrollment.completed_at ?? new Date().toISOString()
      : null;
  
    const { error: updateError } = await supabase
      .from("course_enrollments")
      .update({
        progress_percentage: progressPercentage,
        completed_at: completedAt,
        last_accessed_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("course_id", courseId);
  
      if (updateError) {
        this.logger.error(
          `Failed to update enrollment progress (user=${userId}, course=${courseId}): ${updateError.message}`,
        );
        return;
      }
  
  }
  
 

  // ==================== REVIEWS ====================

  async addReview(userId: string, createReviewDto: any) {
    const supabase = this.supabaseService.getAdminClient();

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
    const supabase = this.supabaseService.getAdminClient();

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

    // ==================== DASHBOARD / ACTIVITY ====================

    async getRecentEnrollments(instructorId: string, limit = 5) {
      const supabase = this.supabaseService.getAdminClient();
  
      const { data: courses, error: coursesError } = await supabase
        .from("courses")
        .select("id")
        .eq("instructor_id", instructorId);
  
      if (coursesError) {
        this.logger.error(`Failed to fetch instructor courses: ${coursesError.message}`);
        throw new BadRequestException(
          `Failed to fetch instructor courses: ${coursesError.message}`,
        );
      }
  
      if (!courses || courses.length === 0) return [];
      const courseIds = courses.map((c) => c.id);
  
      const { data: enrollments, error: enrollError } = await supabase
        .from("course_enrollments")
        .select(`
          id,
          user_id,
          course_id,
          enrollment_date
        `)
        .in("course_id", courseIds)
        .order("enrollment_date", { ascending: false })
        .limit(limit);
  
      if (enrollError) {
        this.logger.error(`Failed to fetch enrollments: ${enrollError.message}`);
        throw new BadRequestException(
          `Failed to fetch enrollments: ${enrollError.message}`,
        );
      }
  
      if (!enrollments || enrollments.length === 0) return [];
  
      const userIds = [...new Set(enrollments.map((e) => e.user_id))];
  
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .in("id", userIds);
  
      const { data: courseDetails } = await supabase
        .from("courses")
        .select("id, title")
        .in("id", courseIds);
  
      const profileById = new Map((profiles || []).map((p) => [p.id, p]));
      const courseById = new Map((courseDetails || []).map((c) => [c.id, c]));
  
      return enrollments.map((e) => ({
        id: e.id,
        user_id: e.user_id,
        course_id: e.course_id,
        enrollment_date: e.enrollment_date,
        user: profileById.get(e.user_id) ?? null,
        course: courseById.get(e.course_id) ?? null,
      }));
    }
  
    // ==================== INSTRUCTOR STUDENTS ====================
  
    async getInstructorStudents(instructorId: string) {
      const supabase = this.supabaseService.getAdminClient();
  
      // 1. Get instructor's courses
      const { data: courses, error: coursesError } = await supabase
        .from("courses")
        .select("id")
        .eq("instructor_id", instructorId);
  
      if (coursesError) {
        this.logger.error(
          `Failed to fetch instructor courses: ${coursesError.message}`,
        );
        throw new BadRequestException(
          `Failed to fetch instructor courses: ${coursesError.message}`,
        );
      }
  
      if (!courses || courses.length === 0) return [];
  
      const courseIds = courses.map((c) => c.id);
  
      // 2. Get all enrollments for those courses
      const { data: enrollments, error: enrollError } = await supabase
        .from("course_enrollments")
        .select("user_id, course_id, progress_percentage, completed_at")
        .in("course_id", courseIds);
  
      if (enrollError) {
        this.logger.error(
          `Failed to fetch enrollments: ${enrollError.message}`,
        );
        throw new BadRequestException(
          `Failed to fetch enrollments: ${enrollError.message}`,
        );
      }
  
      if (!enrollments || enrollments.length === 0) return [];
  
      // 3. Aggregate per student
      const byStudent = new Map<
        string,
        {
          user_id: string;
          course_count: number;
          total_progress: number;
          completed_count: number;
          course_ids: string[];
        }
      >();
  
      for (const e of enrollments) {
        if (!byStudent.has(e.user_id)) {
          byStudent.set(e.user_id, {
            user_id: e.user_id,
            course_count: 0,
            total_progress: 0,
            completed_count: 0,
            course_ids: [],
          });
        }
        const s = byStudent.get(e.user_id)!;
        s.course_count += 1;
        s.total_progress += Number(e.progress_percentage) || 0;
        if (Number(e.progress_percentage) >= 100 || e.completed_at) {
          s.completed_count += 1;
        }
        s.course_ids.push(e.course_id);
      }
  
      const studentRows = Array.from(byStudent.values()).map((s) => ({
        user_id: s.user_id,
        course_count: s.course_count,
        avg_progress: Math.round(s.total_progress / s.course_count),
        completed_count: s.completed_count,
        course_ids: s.course_ids,
      }));
  
      // 4. Join profiles
      const userIds = studentRows.map((s) => s.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .in("id", userIds);
  
      if (profilesError) {
        this.logger.error(
          `Failed to fetch profiles: ${profilesError.message}`,
        );
      }
  
      const profileById = new Map(
        (profiles || []).map((p: any) => [p.id, p]),
      );
  
      return studentRows.map((s) => ({
        user_id: s.user_id,
        user: profileById.get(s.user_id) ?? null,
        course_count: s.course_count,
        completed_count: s.completed_count,
        avg_progress: s.avg_progress,
        course_ids: s.course_ids,
      }));
    }
  }   

  



