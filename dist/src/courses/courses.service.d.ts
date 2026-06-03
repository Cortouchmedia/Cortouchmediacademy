import { SupabaseService } from "../../supabase.service";
export declare class CoursesService {
    private readonly supabaseService;
    private readonly logger;
    constructor(supabaseService: SupabaseService);
    createCourse(instructorId: string, createCourseDto: any): Promise<any>;
    getAllCourses(filters?: {
        category?: string;
        level?: string;
        search?: string;
    }): Promise<any[]>;
    getCourseById(courseId: string): Promise<any>;
    updateCourse(courseId: string, instructorId: string, updateCourseDto: any): Promise<any>;
    deleteCourse(courseId: string, instructorId: string): Promise<{
        message: string;
    }>;
    getInstructorCourses(instructorId: string): Promise<any[]>;
    addModule(courseId: string, instructorId: string, createModuleDto: any): Promise<any>;
    updateModule(moduleId: string, instructorId: string, updateData: any): Promise<any>;
    deleteModule(moduleId: string, instructorId: string): Promise<{
        message: string;
    }>;
    addLesson(moduleId: string, instructorId: string, createLessonDto: any): Promise<any>;
    updateLesson(lessonId: string, instructorId: string, updateData: any): Promise<any>;
    deleteLesson(lessonId: string, instructorId: string): Promise<{
        message: string;
    }>;
    enrollInCourse(userId: string, courseId: string): Promise<any>;
    getUserEnrollments(userId: string): Promise<any[]>;
    getCourseProgress(userId: string, courseId: string): Promise<{
        enrollment: any;
        modules: {
            id: any;
            title: any;
            description: any;
            order_number: any;
            lessons: any;
        }[];
        stats: {
            totalLessons: number;
            completedLessons: number;
            progressPercentage: number;
            remainingLessons: number;
        };
    }>;
    updateLessonProgress(userId: string, progressDto: any): Promise<any>;
    private updateCourseProgress;
    addReview(userId: string, createReviewDto: any): Promise<any>;
    getCourseReviews(courseId: string): Promise<{
        reviews: any[];
        total: number;
        distribution: {
            1: number;
            2: number;
            3: number;
            4: number;
            5: number;
        };
    }>;
}
