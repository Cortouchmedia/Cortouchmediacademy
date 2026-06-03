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
var ProjectsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase.service");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
const uuid_1 = require("uuid");
let ProjectsService = ProjectsService_1 = class ProjectsService {
    constructor(supabaseService, cloudinaryService) {
        this.supabaseService = supabaseService;
        this.cloudinaryService = cloudinaryService;
        this.logger = new common_1.Logger(ProjectsService_1.name);
    }
    getSupabaseClient() {
        return this.supabaseService.getClient();
    }
    async createProject(createDto) {
        const supabase = this.getSupabaseClient();
        const { data, error } = await supabase
            .from("projects")
            .insert({
            ...createDto,
            created_at: new Date(),
            updated_at: new Date(),
        })
            .select()
            .single();
        if (error) {
            throw new common_1.BadRequestException(`Failed to create project: ${error.message}`);
        }
        return data;
    }
    async getAllProjects(filters) {
        const supabase = this.getSupabaseClient();
        let query = supabase.from("projects").select(`
        *,
        course:course_id(title),
        instructor:instructor_id(full_name, email),
        submissions_count:project_submissions(count)
      `);
        if (filters?.course_id) {
            query = query.eq("course_id", filters.course_id);
        }
        if (filters?.instructor_id) {
            query = query.eq("instructor_id", filters.instructor_id);
        }
        if (filters?.is_active !== undefined) {
            query = query.eq("is_active", filters.is_active);
        }
        const page = filters?.page || 1;
        const limit = filters?.limit || 20;
        const start = (page - 1) * limit;
        const end = start + limit - 1;
        const { data, error, count } = await query
            .order("created_at", { ascending: false })
            .range(start, end);
        if (error) {
            throw new common_1.BadRequestException(`Failed to fetch projects: ${error.message}`);
        }
        return {
            projects: data || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            },
        };
    }
    async getProjectById(projectId) {
        const supabase = this.getSupabaseClient();
        const { data: project, error } = await supabase
            .from("projects")
            .select(`
        *,
        course:course_id(*),
        instructor:instructor_id(id, full_name, email),
        submissions:project_submissions(*)
      `)
            .eq("id", projectId)
            .single();
        if (error || !project) {
            throw new common_1.NotFoundException("Project not found");
        }
        return project;
    }
    async updateProject(projectId, instructorId, updateDto) {
        const supabase = this.getSupabaseClient();
        const { data: project } = await supabase
            .from("projects")
            .select("instructor_id")
            .eq("id", projectId)
            .single();
        if (!project || project.instructor_id !== instructorId) {
            throw new common_1.BadRequestException("You can only update your own projects");
        }
        const { data, error } = await supabase
            .from("projects")
            .update({
            ...updateDto,
            updated_at: new Date(),
        })
            .eq("id", projectId)
            .select()
            .single();
        if (error) {
            throw new common_1.BadRequestException(`Failed to update project: ${error.message}`);
        }
        return data;
    }
    async deleteProject(projectId, instructorId) {
        const supabase = this.getSupabaseClient();
        const { data: project } = await supabase
            .from("projects")
            .select("instructor_id")
            .eq("id", projectId)
            .single();
        if (!project || project.instructor_id !== instructorId) {
            throw new common_1.BadRequestException("You can only delete your own projects");
        }
        const { error } = await supabase
            .from("projects")
            .delete()
            .eq("id", projectId);
        if (error) {
            throw new common_1.BadRequestException(`Failed to delete project: ${error.message}`);
        }
        return { success: true, message: "Project deleted successfully" };
    }
    async submitProject(submitDto, files) {
        const supabase = this.getSupabaseClient();
        const { data: project, error: projectError } = await supabase
            .from("projects")
            .select("max_submissions, due_date, title")
            .eq("id", submitDto.project_id)
            .single();
        if (projectError || !project) {
            throw new common_1.NotFoundException("Project not found");
        }
        const { data: existingSubmissions, count } = await supabase
            .from("project_submissions")
            .select("id", { count: "exact" })
            .eq("project_id", submitDto.project_id)
            .eq("student_id", submitDto.student_id);
        const submissionNumber = (count || 0) + 1;
        if (submissionNumber > project.max_submissions) {
            throw new common_1.BadRequestException(`Maximum ${project.max_submissions} submissions allowed`);
        }
        const uploadedFiles = [];
        if (files && files.length > 0) {
            for (const file of files) {
                const uploadResult = await this.cloudinaryService.uploadFile(file.buffer, {
                    folder: `projects/${submitDto.project_id}/${submitDto.student_id}`,
                    public_id: `${(0, uuid_1.v4)()}-${file.originalname}`,
                    resource_type: "auto",
                });
                uploadedFiles.push({
                    filename: file.originalname,
                    url: uploadResult.secure_url,
                    public_id: uploadResult.public_id,
                    size: file.size,
                    mime_type: file.mimetype,
                    uploaded_at: new Date(),
                });
            }
        }
        const isLate = project.due_date
            ? new Date() > new Date(project.due_date)
            : false;
        const { data: submission, error } = await supabase
            .from("project_submissions")
            .insert({
            project_id: submitDto.project_id,
            student_id: submitDto.student_id,
            title: submitDto.title,
            description: submitDto.description,
            files: [...(submitDto.files || []), ...uploadedFiles],
            submission_url: submitDto.submission_url,
            status: "submitted",
            submitted_at: new Date(),
            submission_number: submissionNumber,
            is_late: isLate,
        })
            .select()
            .single();
        if (error) {
            throw new common_1.BadRequestException(`Failed to submit project: ${error.message}`);
        }
        return {
            success: true,
            message: "Project submitted successfully",
            submission,
            isLate,
        };
    }
    async getStudentSubmissions(studentId, projectId) {
        const supabase = this.getSupabaseClient();
        let query = supabase
            .from("project_submissions")
            .select(`
        *,
        project:project_id(*),
        grader:graded_by(id, full_name, email)
      `)
            .eq("student_id", studentId)
            .order("submitted_at", { ascending: false });
        if (projectId) {
            query = query.eq("project_id", projectId);
        }
        const { data, error } = await query;
        if (error) {
            throw new common_1.BadRequestException(`Failed to fetch submissions: ${error.message}`);
        }
        return data || [];
    }
    async getProjectSubmissions(projectId, instructorId) {
        const supabase = this.getSupabaseClient();
        const { data: project } = await supabase
            .from("projects")
            .select("instructor_id")
            .eq("id", projectId)
            .single();
        if (!project || project.instructor_id !== instructorId) {
            throw new common_1.BadRequestException("You can only view submissions for your own projects");
        }
        const { data, error } = await supabase
            .from("project_submissions")
            .select(`
        *,
        student:student_id(id, full_name, email, profile_picture),
        comments:project_comments(*)
      `)
            .eq("project_id", projectId)
            .order("submitted_at", { ascending: false });
        if (error) {
            throw new common_1.BadRequestException(`Failed to fetch submissions: ${error.message}`);
        }
        return data || [];
    }
    async getSubmissionById(submissionId) {
        const supabase = this.getSupabaseClient();
        const { data: submission, error } = await supabase
            .from("project_submissions")
            .select(`
        *,
        project:project_id(*),
        student:student_id(id, full_name, email, profile_picture),
        grader:graded_by(id, full_name, email),
        comments:project_comments(*, user:user_id(id, full_name, profile_picture))
      `)
            .eq("id", submissionId)
            .single();
        if (error || !submission) {
            throw new common_1.NotFoundException("Submission not found");
        }
        return submission;
    }
    async gradeSubmission(submissionId, gradeDto) {
        const supabase = this.getSupabaseClient();
        const { data: submission, error } = await supabase
            .from("project_submissions")
            .update({
            grade: gradeDto.grade,
            feedback: gradeDto.feedback,
            graded_by: gradeDto.instructor_id,
            graded_at: new Date(),
            status: "graded",
            updated_at: new Date(),
        })
            .eq("id", submissionId)
            .select()
            .single();
        if (error) {
            throw new common_1.BadRequestException(`Failed to grade submission: ${error.message}`);
        }
        return {
            success: true,
            message: "Submission graded successfully",
            submission,
        };
    }
    async requestResubmission(submissionId, instructorId, feedback) {
        const supabase = this.getSupabaseClient();
        const { data, error } = await supabase
            .from("project_submissions")
            .update({
            status: "resubmitted",
            feedback: feedback,
            updated_at: new Date(),
        })
            .eq("id", submissionId)
            .select()
            .single();
        if (error) {
            throw new common_1.BadRequestException(`Failed to request resubmission: ${error.message}`);
        }
        return {
            success: true,
            message: "Resubmission requested",
            submission: data,
        };
    }
    async addComment(commentDto, attachments) {
        const supabase = this.getSupabaseClient();
        const uploadedAttachments = [];
        if (attachments && attachments.length > 0) {
            for (const file of attachments) {
                const uploadResult = await this.cloudinaryService.uploadFile(file.buffer, {
                    folder: `project-comments/${commentDto.submission_id}`,
                    public_id: `${(0, uuid_1.v4)()}-${file.originalname}`,
                });
                uploadedAttachments.push({
                    filename: file.originalname,
                    url: uploadResult.secure_url,
                    size: file.size,
                });
            }
        }
        const { data, error } = await supabase
            .from("project_comments")
            .insert({
            submission_id: commentDto.submission_id,
            user_id: commentDto.user_id,
            comment: commentDto.comment,
            attachments: [
                ...(commentDto.attachments || []),
                ...uploadedAttachments,
            ],
            created_at: new Date(),
        })
            .select(`
        *,
        user:user_id(id, full_name, email, profile_picture)
      `)
            .single();
        if (error) {
            throw new common_1.BadRequestException(`Failed to add comment: ${error.message}`);
        }
        return data;
    }
    async getComments(submissionId) {
        const supabase = this.getSupabaseClient();
        const { data, error } = await supabase
            .from("project_comments")
            .select(`
        *,
        user:user_id(id, full_name, email, profile_picture)
      `)
            .eq("submission_id", submissionId)
            .order("created_at", { ascending: true });
        if (error) {
            throw new common_1.BadRequestException(`Failed to fetch comments: ${error.message}`);
        }
        return data || [];
    }
    async getProjectStats(projectId, instructorId) {
        const supabase = this.getSupabaseClient();
        const { data: project } = await supabase
            .from("projects")
            .select("instructor_id")
            .eq("id", projectId)
            .single();
        if (!project || project.instructor_id !== instructorId) {
            throw new common_1.BadRequestException("Unauthorized");
        }
        const { data: submissions } = await supabase
            .from("project_submissions")
            .select("grade, status, is_late")
            .eq("project_id", projectId);
        const totalSubmissions = submissions?.length || 0;
        const gradedCount = submissions?.filter((s) => s.status === "graded").length || 0;
        const lateCount = submissions?.filter((s) => s.is_late).length || 0;
        const grades = submissions?.filter((s) => s.grade !== null).map((s) => s.grade) || [];
        const averageGrade = grades.length > 0 ? grades.reduce((a, b) => a + b, 0) / grades.length : 0;
        return {
            total_submissions: totalSubmissions,
            graded_count: gradedCount,
            ungraded_count: totalSubmissions - gradedCount,
            late_count: lateCount,
            average_grade: Math.round(averageGrade * 10) / 10,
            grade_distribution: {
                A: grades.filter((g) => g >= 90).length,
                B: grades.filter((g) => g >= 80 && g < 90).length,
                C: grades.filter((g) => g >= 70 && g < 80).length,
                D: grades.filter((g) => g >= 60 && g < 70).length,
                F: grades.filter((g) => g < 60).length,
            },
        };
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = ProjectsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService,
        cloudinary_service_1.CloudinaryService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map