import { CoursesService } from "./courses.service";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";
import { CreateModuleDto } from "./dto/create-module.dto";
import { CreateLessonDto } from "./dto/create-lesson.dto";
import { LessonProgressDto } from "./dto/lesson-progress.dto";
import { CreateReviewDto } from "./dto/create-review.dto";
import { EnrollCourseDto } from "./dto/enroll-course.dto";
export declare class CoursesController {
    private readonly coursesService;
    constructor(coursesService: CoursesService);
    getAllCourses(category?: string, level?: string, search?: string): Promise<any[]>;
    getCourseById(id: string): Promise<any>;
    getCourseReviews(id: string): Promise<{
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
    createCourse(createCourseDto: CreateCourseDto, instructorId: string): Promise<any>;
    updateCourse(id: string, updateCourseDto: UpdateCourseDto, instructorId: string): Promise<any>;
    deleteCourse(id: string, instructorId: string): Promise<{
        message: string;
    }>;
    getInstructorCourses(instructorId: string): Promise<any[]>;
    addModule(courseId: string, createModuleDto: CreateModuleDto, instructorId: string): Promise<any>;
    updateModule(moduleId: string, updateData: any, instructorId: string): Promise<any>;
    deleteModule(moduleId: string, instructorId: string): Promise<{
        message: string;
    }>;
    addLesson(moduleId: string, createLessonDto: CreateLessonDto, instructorId: string): Promise<any>;
    updateLesson(lessonId: string, updateData: any, instructorId: string): Promise<any>;
    deleteLesson(lessonId: string, instructorId: string): Promise<{
        message: string;
    }>;
    enrollCourse(enrollDto: EnrollCourseDto, userId: string): Promise<any>;
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
    updateProgress(progressDto: LessonProgressDto, userId: string): Promise<any>;
    addReview(createReviewDto: CreateReviewDto, userId: string): Promise<any>;
}
