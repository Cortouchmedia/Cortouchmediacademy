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
var CoursesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoursesService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase.service");
let CoursesService = CoursesService_1 = class CoursesService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
        this.logger = new common_1.Logger(CoursesService_1.name);
    }
    async createCourse(instructorId, createCourseDto) {
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
            throw new common_1.BadRequestException(`Failed to create course: ${error.message}`);
        }
        return data;
    }
    async getAllCourses(filters) {
        const supabase = this.supabaseService.getClient();
        let query = supabase
            .from("courses")
            .select(`
        *,
        instructor:instructor_id(id, full_name, email)
      `)
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
            throw new common_1.BadRequestException(`Failed to fetch courses: ${error.message}`);
        }
        return data || [];
    }
    async getCourseById(courseId) {
        const supabase = this.supabaseService.getClient();
        const { data: course, error: courseError } = await supabase
            .from("courses")
            .select(`
        *,
        instructor:instructor_id(id, full_name, email, about_me)
      `)
            .eq("id", courseId)
            .single();
        if (courseError || !course) {
            throw new common_1.NotFoundException("Course not found");
        }
        const { data: modules } = await supabase
            .from("course_modules")
            .select(`
        *,
        lessons:course_lessons(*)
      `)
            .eq("course_id", courseId)
            .order("order_number", { ascending: true });
        const allLessons = modules?.flatMap((m) => m.lessons) || [];
        const totalLessons = allLessons.length;
        const totalDuration = allLessons.reduce((sum, lesson) => sum + (lesson.video_duration || 0), 0);
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
    async updateCourse(courseId, instructorId, updateCourseDto) {
        const supabase = this.supabaseService.getClient();
        const { data: existingCourse, error: findError } = await supabase
            .from("courses")
            .select("id")
            .eq("id", courseId)
            .eq("instructor_id", instructorId)
            .single();
        if (findError || !existingCourse) {
            throw new common_1.NotFoundException("Course not found or you do not have permission");
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
            throw new common_1.BadRequestException(`Failed to update course: ${error.message}`);
        }
        return data;
    }
    async deleteCourse(courseId, instructorId) {
        const supabase = this.supabaseService.getClient();
        const { error } = await supabase
            .from("courses")
            .delete()
            .eq("id", courseId)
            .eq("instructor_id", instructorId);
        if (error) {
            this.logger.error(`Failed to delete course: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to delete course: ${error.message}`);
        }
        return { message: "Course deleted successfully" };
    }
    async getInstructorCourses(instructorId) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from("courses")
            .select("*")
            .eq("instructor_id", instructorId)
            .order("created_at", { ascending: false });
        if (error) {
            this.logger.error(`Failed to fetch instructor courses: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to fetch instructor courses: ${error.message}`);
        }
        return data || [];
    }
    async addModule(courseId, instructorId, createModuleDto) {
        const supabase = this.supabaseService.getClient();
        const { data: course, error: courseError } = await supabase
            .from("courses")
            .select("id")
            .eq("id", courseId)
            .eq("instructor_id", instructorId)
            .single();
        if (courseError || !course) {
            throw new common_1.NotFoundException("Course not found or you do not have permission");
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
            throw new common_1.BadRequestException(`Failed to add module: ${error.message}`);
        }
        return data;
    }
    async updateModule(moduleId, instructorId, updateData) {
        const supabase = this.supabaseService.getClient();
        const { data: module, error: moduleError } = await supabase
            .from("course_modules")
            .select("course_id")
            .eq("id", moduleId)
            .single();
        if (moduleError || !module) {
            throw new common_1.NotFoundException("Module not found");
        }
        const { data: course, error: courseError } = await supabase
            .from("courses")
            .select("instructor_id")
            .eq("id", module.course_id)
            .single();
        if (courseError || !course || course.instructor_id !== instructorId) {
            throw new common_1.ForbiddenException("You do not have permission to modify this module");
        }
        const { data, error } = await supabase
            .from("course_modules")
            .update(updateData)
            .eq("id", moduleId)
            .select()
            .single();
        if (error) {
            this.logger.error(`Failed to update module: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to update module: ${error.message}`);
        }
        return data;
    }
    async deleteModule(moduleId, instructorId) {
        const supabase = this.supabaseService.getClient();
        const { data: module, error: moduleError } = await supabase
            .from("course_modules")
            .select("course_id")
            .eq("id", moduleId)
            .single();
        if (moduleError || !module) {
            throw new common_1.NotFoundException("Module not found");
        }
        const { data: course, error: courseError } = await supabase
            .from("courses")
            .select("instructor_id")
            .eq("id", module.course_id)
            .single();
        if (courseError || !course || course.instructor_id !== instructorId) {
            throw new common_1.ForbiddenException("You do not have permission to delete this module");
        }
        const { error } = await supabase
            .from("course_modules")
            .delete()
            .eq("id", moduleId);
        if (error) {
            this.logger.error(`Failed to delete module: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to delete module: ${error.message}`);
        }
        return { message: "Module deleted successfully" };
    }
    async addLesson(moduleId, instructorId, createLessonDto) {
        const supabase = this.supabaseService.getClient();
        const { data: module, error: moduleError } = await supabase
            .from("course_modules")
            .select("course_id")
            .eq("id", moduleId)
            .single();
        if (moduleError || !module) {
            throw new common_1.NotFoundException("Module not found");
        }
        const { data: course, error: courseError } = await supabase
            .from("courses")
            .select("instructor_id")
            .eq("id", module.course_id)
            .single();
        if (courseError || !course || course.instructor_id !== instructorId) {
            throw new common_1.ForbiddenException("You do not have permission to add lessons to this module");
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
            throw new common_1.BadRequestException(`Failed to add lesson: ${error.message}`);
        }
        return data;
    }
    async updateLesson(lessonId, instructorId, updateData) {
        const supabase = this.supabaseService.getClient();
        const { data: lesson, error: lessonError } = await supabase
            .from("course_lessons")
            .select("module:course_modules(course_id)")
            .eq("id", lessonId)
            .single();
        if (lessonError || !lesson) {
            throw new common_1.NotFoundException("Lesson not found");
        }
        const courseId = lesson.module?.course_id;
        if (!courseId) {
            throw new common_1.NotFoundException("Course not found for this lesson");
        }
        const { data: course, error: courseError } = await supabase
            .from("courses")
            .select("instructor_id")
            .eq("id", courseId)
            .single();
        if (courseError || !course || course.instructor_id !== instructorId) {
            throw new common_1.ForbiddenException("You do not have permission to modify this lesson");
        }
        const { data, error } = await supabase
            .from("course_lessons")
            .update(updateData)
            .eq("id", lessonId)
            .select()
            .single();
        if (error) {
            this.logger.error(`Failed to update lesson: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to update lesson: ${error.message}`);
        }
        return data;
    }
    async deleteLesson(lessonId, instructorId) {
        const supabase = this.supabaseService.getClient();
        const { data: lesson, error: lessonError } = await supabase
            .from("course_lessons")
            .select("module:course_modules(course_id)")
            .eq("id", lessonId)
            .single();
        if (lessonError || !lesson) {
            throw new common_1.NotFoundException("Lesson not found");
        }
        const courseId = lesson.module?.course_id;
        if (!courseId) {
            throw new common_1.NotFoundException("Course not found for this lesson");
        }
        const { data: course, error: courseError } = await supabase
            .from("courses")
            .select("instructor_id")
            .eq("id", courseId)
            .single();
        if (courseError || !course || course.instructor_id !== instructorId) {
            throw new common_1.ForbiddenException("You do not have permission to delete this lesson");
        }
        const { error } = await supabase
            .from("course_lessons")
            .delete()
            .eq("id", lessonId);
        if (error) {
            this.logger.error(`Failed to delete lesson: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to delete lesson: ${error.message}`);
        }
        return { message: "Lesson deleted successfully" };
    }
    async enrollInCourse(userId, courseId) {
        const supabase = this.supabaseService.getClient();
        const { data: existing } = await supabase
            .from("course_enrollments")
            .select("id")
            .eq("user_id", userId)
            .eq("course_id", courseId)
            .maybeSingle();
        if (existing) {
            throw new common_1.BadRequestException("Already enrolled in this course");
        }
        const { data: course } = await supabase
            .from("courses")
            .select("id, status")
            .eq("id", courseId)
            .single();
        if (!course || course.status !== "PUBLISHED") {
            throw new common_1.BadRequestException("Course is not available for enrollment");
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
            throw new common_1.BadRequestException(`Failed to enroll: ${error.message}`);
        }
        return data;
    }
    async getUserEnrollments(userId) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from("course_enrollments")
            .select(`
        *,
        course:courses(*)
      `)
            .eq("user_id", userId)
            .order("enrollment_date", { ascending: false });
        if (error) {
            this.logger.error(`Failed to fetch enrollments: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to fetch enrollments: ${error.message}`);
        }
        return data || [];
    }
    async getCourseProgress(userId, courseId) {
        const supabase = this.supabaseService.getClient();
        const { data: enrollment, error: enrollmentError } = await supabase
            .from("course_enrollments")
            .select("*")
            .eq("user_id", userId)
            .eq("course_id", courseId)
            .single();
        if (enrollmentError || !enrollment) {
            throw new common_1.NotFoundException("Enrollment not found");
        }
        const { data: modules, error: modulesError } = await supabase
            .from("course_modules")
            .select("*")
            .eq("course_id", courseId)
            .order("order_number", { ascending: true });
        if (modulesError) {
            throw new common_1.BadRequestException(`Failed to fetch modules: ${modulesError.message}`);
        }
        const moduleIds = modules?.map((m) => m.id) || [];
        const { data: lessons, error: lessonsError } = await supabase
            .from("course_lessons")
            .select("*")
            .in("module_id", moduleIds)
            .order("order_number", { ascending: true });
        if (lessonsError) {
            throw new common_1.BadRequestException(`Failed to fetch lessons: ${lessonsError.message}`);
        }
        const lessonIds = lessons?.map((l) => l.id) || [];
        const { data: progressRecords } = await supabase
            .from("user_lesson_progress")
            .select("*")
            .eq("user_id", userId)
            .in("lesson_id", lessonIds);
        const totalLessons = lessons?.length || 0;
        const completedLessons = progressRecords?.filter((r) => r.is_completed === true).length || 0;
        const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
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
    async updateLessonProgress(userId, progressDto) {
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
        }
        else {
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
            throw new common_1.BadRequestException(`Failed to update progress: ${result.error.message}`);
        }
        await this.updateCourseProgress(userId, progressDto.lesson_id);
        return result.data;
    }
    async updateCourseProgress(userId, lessonId) {
        const supabase = this.supabaseService.getClient();
        const { data: lesson } = await supabase
            .from("course_lessons")
            .select("module_id")
            .eq("id", lessonId)
            .single();
        if (!lesson)
            return;
        const { data: module } = await supabase
            .from("course_modules")
            .select("course_id")
            .eq("id", lesson.module_id)
            .single();
        if (!module)
            return;
        const courseId = module.course_id;
        const { data: allLessons } = await supabase
            .from("course_lessons")
            .select("id")
            .eq("module.course_id", courseId);
        if (!allLessons || allLessons.length === 0)
            return;
        const { data: completedLessons } = await supabase
            .from("user_lesson_progress")
            .select("lesson_id")
            .eq("user_id", userId)
            .eq("is_completed", true)
            .in("lesson_id", allLessons.map((l) => l.id));
        const totalLessons = allLessons.length;
        const completedCount = completedLessons?.length || 0;
        const progressPercentage = (completedCount / totalLessons) * 100;
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
    async addReview(userId, createReviewDto) {
        const supabase = this.supabaseService.getClient();
        const { data: enrollment } = await supabase
            .from("course_enrollments")
            .select("id")
            .eq("user_id", userId)
            .eq("course_id", createReviewDto.course_id)
            .single();
        if (!enrollment) {
            throw new common_1.BadRequestException("You must be enrolled to review this course");
        }
        const { data: existingReview } = await supabase
            .from("course_reviews")
            .select("id")
            .eq("user_id", userId)
            .eq("course_id", createReviewDto.course_id)
            .maybeSingle();
        if (existingReview) {
            throw new common_1.BadRequestException("You have already reviewed this course");
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
            throw new common_1.BadRequestException(`Failed to add review: ${error.message}`);
        }
        return data;
    }
    async getCourseReviews(courseId) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from("course_reviews")
            .select(`
        *,
        user:user_id(id, full_name, profile_picture)
      `)
            .eq("course_id", courseId)
            .order("created_at", { ascending: false });
        if (error) {
            this.logger.error(`Failed to fetch reviews: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to fetch reviews: ${error.message}`);
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
                distribution[review.rating]++;
            }
        });
        return {
            reviews: data || [],
            total: data?.length || 0,
            distribution,
        };
    }
};
exports.CoursesService = CoursesService;
exports.CoursesService = CoursesService = CoursesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], CoursesService);
//# sourceMappingURL=courses.service.js.map