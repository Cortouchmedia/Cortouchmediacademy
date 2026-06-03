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
exports.ProjectsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const projects_service_1 = require("./projects.service");
const project_dto_1 = require("./dto/project.dto");
let ProjectsController = class ProjectsController {
    constructor(projectsService) {
        this.projectsService = projectsService;
    }
    async createProject(createDto) {
        return this.projectsService.createProject(createDto);
    }
    async getAllProjects(course_id, instructor_id, is_active, page, limit) {
        return this.projectsService.getAllProjects({
            course_id,
            instructor_id,
            is_active,
            page: page ? +page : 1,
            limit: limit ? +limit : 20,
        });
    }
    async getProjectById(id) {
        return this.projectsService.getProjectById(id);
    }
    async updateProject(id, instructorId, updateDto) {
        return this.projectsService.updateProject(id, instructorId, updateDto);
    }
    async deleteProject(id, instructorId) {
        return this.projectsService.deleteProject(id, instructorId);
    }
    async submitProject(files, submitDto) {
        return this.projectsService.submitProject(submitDto, files);
    }
    async getStudentSubmissions(studentId, projectId) {
        return this.projectsService.getStudentSubmissions(studentId, projectId);
    }
    async getProjectSubmissions(projectId, instructorId) {
        return this.projectsService.getProjectSubmissions(projectId, instructorId);
    }
    async getSubmissionById(submissionId) {
        return this.projectsService.getSubmissionById(submissionId);
    }
    async gradeSubmission(submissionId, gradeDto) {
        return this.projectsService.gradeSubmission(submissionId, gradeDto);
    }
    async requestResubmission(submissionId, instructorId, feedback) {
        return this.projectsService.requestResubmission(submissionId, instructorId, feedback);
    }
    async addComment(files, commentDto) {
        return this.projectsService.addComment(commentDto, files);
    }
    async getComments(submissionId) {
        return this.projectsService.getComments(submissionId);
    }
    async getProjectStats(projectId, instructorId) {
        return this.projectsService.getProjectStats(projectId, instructorId);
    }
};
exports.ProjectsController = ProjectsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [project_dto_1.CreateProjectDto]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "createProject", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)("course_id")),
    __param(1, (0, common_1.Query)("instructor_id")),
    __param(2, (0, common_1.Query)("is_active")),
    __param(3, (0, common_1.Query)("page")),
    __param(4, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Boolean, Number, Number]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getAllProjects", null);
__decorate([
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getProjectById", null);
__decorate([
    (0, common_1.Put)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("instructorId")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, project_dto_1.UpdateProjectDto]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "updateProject", null);
__decorate([
    (0, common_1.Delete)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("instructorId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "deleteProject", null);
__decorate([
    (0, common_1.Post)("submit"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)("files", 10)),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, project_dto_1.SubmitProjectDto]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "submitProject", null);
__decorate([
    (0, common_1.Get)("student/:studentId/submissions"),
    __param(0, (0, common_1.Param)("studentId")),
    __param(1, (0, common_1.Query)("project_id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getStudentSubmissions", null);
__decorate([
    (0, common_1.Get)("project/:projectId/submissions"),
    __param(0, (0, common_1.Param)("projectId")),
    __param(1, (0, common_1.Query)("instructorId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getProjectSubmissions", null);
__decorate([
    (0, common_1.Get)("submissions/:submissionId"),
    __param(0, (0, common_1.Param)("submissionId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getSubmissionById", null);
__decorate([
    (0, common_1.Put)("submissions/:submissionId/grade"),
    __param(0, (0, common_1.Param)("submissionId")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, project_dto_1.GradeSubmissionDto]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "gradeSubmission", null);
__decorate([
    (0, common_1.Post)("submissions/:submissionId/resubmit"),
    __param(0, (0, common_1.Param)("submissionId")),
    __param(1, (0, common_1.Query)("instructorId")),
    __param(2, (0, common_1.Body)("feedback")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "requestResubmission", null);
__decorate([
    (0, common_1.Post)("comments"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)("attachments", 5)),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, project_dto_1.AddCommentDto]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "addComment", null);
__decorate([
    (0, common_1.Get)("submissions/:submissionId/comments"),
    __param(0, (0, common_1.Param)("submissionId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getComments", null);
__decorate([
    (0, common_1.Get)(":projectId/stats"),
    __param(0, (0, common_1.Param)("projectId")),
    __param(1, (0, common_1.Query)("instructorId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getProjectStats", null);
exports.ProjectsController = ProjectsController = __decorate([
    (0, common_1.Controller)("api/projects"),
    __metadata("design:paramtypes", [projects_service_1.ProjectsService])
], ProjectsController);
//# sourceMappingURL=projects.controller.js.map