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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoursesController = void 0;
const common_1 = require("@nestjs/common");
const courses_service_1 = require("./courses.service");
const create_course_dto_1 = require("./dto/create-course.dto");
const update_course_dto_1 = require("./dto/update-course.dto");
const create_module_dto_1 = require("./dto/create-module.dto");
const create_lesson_dto_1 = require("./dto/create-lesson.dto");
const lesson_progress_dto_1 = require("./dto/lesson-progress.dto");
const create_review_dto_1 = require("./dto/create-review.dto");
const enroll_course_dto_1 = require("./dto/enroll-course.dto");
let CoursesController = class CoursesController {
    constructor(coursesService) {
        this.coursesService = coursesService;
    }
    async getAllCourses(category, level, search) {
        return this.coursesService.getAllCourses({ category, level, search });
    }
    async getCourseById(id) {
        return this.coursesService.getCourseById(id);
    }
    async getCourseReviews(id) {
        return this.coursesService.getCourseReviews(id);
    }
    async createCourse(createCourseDto, instructorId) {
        return this.coursesService.createCourse(instructorId, createCourseDto);
    }
    async updateCourse(id, updateCourseDto, instructorId) {
        return this.coursesService.updateCourse(id, instructorId, updateCourseDto);
    }
    async deleteCourse(id, instructorId) {
        return this.coursesService.deleteCourse(id, instructorId);
    }
    async getInstructorCourses(instructorId) {
        return this.coursesService.getInstructorCourses(instructorId);
    }
    async addModule(courseId, createModuleDto, instructorId) {
        return this.coursesService.addModule(courseId, instructorId, createModuleDto);
    }
    async updateModule(moduleId, updateData, instructorId) {
        return this.coursesService.updateModule(moduleId, instructorId, updateData);
    }
    async deleteModule(moduleId, instructorId) {
        return this.coursesService.deleteModule(moduleId, instructorId);
    }
    async addLesson(moduleId, createLessonDto, instructorId) {
        return this.coursesService.addLesson(moduleId, instructorId, createLessonDto);
    }
    async updateLesson(lessonId, updateData, instructorId) {
        return this.coursesService.updateLesson(lessonId, instructorId, updateData);
    }
    async deleteLesson(lessonId, instructorId) {
        return this.coursesService.deleteLesson(lessonId, instructorId);
    }
    async enrollCourse(enrollDto, userId) {
        return this.coursesService.enrollInCourse(userId, enrollDto.course_id);
    }
    async getUserEnrollments(userId) {
        return this.coursesService.getUserEnrollments(userId);
    }
    async getCourseProgress(userId, courseId) {
        return this.coursesService.getCourseProgress(userId, courseId);
    }
    async updateProgress(progressDto, userId) {
        return this.coursesService.updateLessonProgress(userId, progressDto);
    }
    async addReview(createReviewDto, userId) {
        return this.coursesService.addReview(userId, createReviewDto);
    }
};
exports.CoursesController = CoursesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)("category")),
    __param(1, (0, common_1.Query)("level")),
    __param(2, (0, common_1.Query)("search")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getAllCourses", null);
__decorate([
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getCourseById", null);
__decorate([
    (0, common_1.Get)(":id/reviews"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getCourseReviews", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)("instructorId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_course_dto_1.CreateCourseDto, String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "createCourse", null);
__decorate([
    (0, common_1.Put)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)("instructorId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_course_dto_1.UpdateCourseDto, String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "updateCourse", null);
__decorate([
    (0, common_1.Delete)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("instructorId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "deleteCourse", null);
__decorate([
    (0, common_1.Get)("instructor/:instructorId/courses"),
    __param(0, (0, common_1.Param)("instructorId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getInstructorCourses", null);
__decorate([
    (0, common_1.Post)("courses/:courseId/modules"),
    __param(0, (0, common_1.Param)("courseId")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)("instructorId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_module_dto_1.CreateModuleDto, String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "addModule", null);
__decorate([
    (0, common_1.Put)("modules/:moduleId"),
    __param(0, (0, common_1.Param)("moduleId")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)("instructorId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "updateModule", null);
__decorate([
    (0, common_1.Delete)("modules/:moduleId"),
    __param(0, (0, common_1.Param)("moduleId")),
    __param(1, (0, common_1.Query)("instructorId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "deleteModule", null);
__decorate([
    (0, common_1.Post)("modules/:moduleId/lessons"),
    __param(0, (0, common_1.Param)("moduleId")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)("instructorId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_lesson_dto_1.CreateLessonDto, String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "addLesson", null);
__decorate([
    (0, common_1.Put)("lessons/:lessonId"),
    __param(0, (0, common_1.Param)("lessonId")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)("instructorId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "updateLesson", null);
__decorate([
    (0, common_1.Delete)("lessons/:lessonId"),
    __param(0, (0, common_1.Param)("lessonId")),
    __param(1, (0, common_1.Query)("instructorId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "deleteLesson", null);
__decorate([
    (0, common_1.Post)("enroll"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [enroll_course_dto_1.EnrollCourseDto, String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "enrollCourse", null);
__decorate([
    (0, common_1.Get)("users/:userId/enrollments"),
    __param(0, (0, common_1.Param)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getUserEnrollments", null);
__decorate([
    (0, common_1.Get)("users/:userId/courses/:courseId/progress"),
    __param(0, (0, common_1.Param)("userId")),
    __param(1, (0, common_1.Param)("courseId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getCourseProgress", null);
__decorate([
    (0, common_1.Patch)("progress"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [lesson_progress_dto_1.LessonProgressDto, String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "updateProgress", null);
__decorate([
    (0, common_1.Post)("reviews"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_review_dto_1.CreateReviewDto, String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "addReview", null);
exports.CoursesController = CoursesController = __decorate([
    (0, common_1.Controller)("api/courses"),
    __metadata("design:paramtypes", [courses_service_1.CoursesService])
], CoursesController);
//# sourceMappingURL=courses.controller.js.map