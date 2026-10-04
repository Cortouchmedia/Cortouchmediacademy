// src/projects/projects.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { AiAssistantService } from "../ai/ai-assistant.service";
import { CertificatesService } from "../certificates/certificates.service";
import {
  CreateProjectDto,
  UpdateProjectDto,
  SubmitProjectDto,
  GradeSubmissionDto,
  AddCommentDto,
} from "./dto/project.dto";
import { v4 as uuidv4 } from "uuid";

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly aiAssistantService: AiAssistantService,
    private readonly certificatesService: CertificatesService,
  ) {}

  getSupabaseClient() {
    return this.supabaseService.getAdminClient();
  }

  // ==================== PROJECT MANAGEMENT ====================

  async createProject(createDto: CreateProjectDto) {
    this.logger.log(`createProject received: ${JSON.stringify(createDto)}`);
    const supabase = this.getSupabaseClient();

    // Fail fast with a clear message if required fields are missing
    if (!createDto.course_id) {
      throw new BadRequestException('course_id is required');
    }
    if (!createDto.instructor_id) {
      throw new BadRequestException('instructor_id is required');
    }
    if (!createDto.title?.trim()) {
      throw new BadRequestException('title is required');
    }
    if (!createDto.description?.trim()) {
      throw new BadRequestException('description is required');
    }

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
      throw new BadRequestException(
        `Failed to create project: ${error.message}`,
      );
    }

    return data;
  }

  async getAllProjects(filters?: {
    course_id?: string;
    instructor_id?: string;
    is_active?: boolean;
    page?: number;
    limit?: number;
  }) {
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
      throw new BadRequestException(
        `Failed to fetch projects: ${error.message}`,
      );
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

  async getProjectById(projectId: string) {
    const supabase = this.getSupabaseClient();

    const { data: project, error } = await supabase
      .from("projects")
      .select(
        `
        *,
        course:course_id(*),
        instructor:instructor_id(id, full_name, email),
        submissions:project_submissions(*)
      `,
      )
      .eq("id", projectId)
      .single();

    if (error || !project) {
      throw new NotFoundException("Project not found");
    }

    return project;
  }

  async updateProject(
    projectId: string,
    instructorId: string,
    updateDto: UpdateProjectDto,
  ) {
    const supabase = this.getSupabaseClient();

    // Verify ownership
    const { data: project } = await supabase
      .from("projects")
      .select("instructor_id")
      .eq("id", projectId)
      .single();

    if (!project || project.instructor_id !== instructorId) {
      throw new BadRequestException("You can only update your own projects");
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
      throw new BadRequestException(
        `Failed to update project: ${error.message}`,
      );
    }

    return data;
  }

  async deleteProject(projectId: string, instructorId: string) {
    const supabase = this.getSupabaseClient();

    const { data: project } = await supabase
      .from("projects")
      .select("instructor_id")
      .eq("id", projectId)
      .single();

    if (!project || project.instructor_id !== instructorId) {
      throw new BadRequestException("You can only delete your own projects");
    }

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (error) {
      throw new BadRequestException(
        `Failed to delete project: ${error.message}`,
      );
    }

    return { success: true, message: "Project deleted successfully" };
  }

  // ==================== SUBMISSIONS ====================

  async submitProject(submitDto: SubmitProjectDto, files?: MulterFile[]) {
    const supabase = this.getSupabaseClient();

    const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("max_submissions, due_date, title, course_id, instructor_id")
    .eq("id", submitDto.project_id)
    .single();

    if (projectError || !project) {
      throw new NotFoundException("Project not found");
    }

    // Check existing submissions count
    const { data: existingSubmissions, count } = await supabase
      .from("project_submissions")
      .select("id", { count: "exact" })
      .eq("project_id", submitDto.project_id)
      .eq("student_id", submitDto.student_id);

    const submissionNumber = (count || 0) + 1;

    if (submissionNumber > project.max_submissions) {
      throw new BadRequestException(
        `Maximum ${project.max_submissions} submissions allowed`,
      );
    }

    // Upload files to Cloudinary
    const uploadedFiles = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const uploadResult = await this.cloudinaryService.uploadFile(
          file.buffer,
          {
            folder: `projects/${submitDto.project_id}/${submitDto.student_id}`,
            public_id: `${uuidv4()}-${file.originalname}`,
            resource_type: "auto",
          },
        );
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

      // Compute the student's individual deadline:
    // 21 days (3 weeks) after they completed the course.
    const { data: enrollment } = await supabase
      .from("course_enrollments")
      .select("completed_at")
      .eq("user_id", submitDto.student_id)
      .eq("course_id", project.course_id)
      .maybeSingle();

    let studentDueDate: Date | null = null;

    if (enrollment?.completed_at) {
      studentDueDate = new Date(
        new Date(enrollment.completed_at).getTime() +
          21 * 24 * 60 * 60 * 1000, // 21 days in ms
      );
    } else if (project.due_date) {

      studentDueDate = new Date(project.due_date);
    }

    const isLate = studentDueDate ? new Date() > studentDueDate : false;

    const { data: submission, error } = await supabase
    .from("project_submissions")
    .insert({
      project_id: submitDto.project_id,
      student_id: submitDto.student_id,
      description: submitDto.description,
      files: uploadedFiles,
      screenshot_urls: uploadedFiles.map((f: any) => f.url),
      submission_url: submitDto.submission_url,
      status: "submitted",
      submitted_at: new Date(),
      submission_number: submissionNumber,
      is_late: isLate,
      student_due_date: studentDueDate ? studentDueDate.toISOString() : null,
    })
    .select()
    .single();

    if (error) {
      throw new BadRequestException(
        `Failed to submit project: ${error.message}`,
      );
    }

    const instructorId = (project as any).instructor_id;
    if (instructorId && submission?.id) {
      this.aiGradeSubmission(submission.id, instructorId).catch((err: any) => {
        this.logger.warn(
          `Auto AI grading failed for submission ${submission.id}: ${err?.message ?? err}`,
        );
      });
    }

    return {
      success: true,
      message: "Project submitted successfully",
      submission,
      isLate,
    };
  }
  async getStudentSubmissions(studentId: string, projectId?: string) {
    const supabase = this.getSupabaseClient();

    let query = supabase
      .from("project_submissions")
      .select(
        `
        *,
        project:project_id(*),
        grader:graded_by(id, full_name, email)
      `,
      )
      .eq("student_id", studentId)
      .order("submitted_at", { ascending: false });

    if (projectId) {
      query = query.eq("project_id", projectId);
    }

    const { data, error } = await query;

    if (error) {
      throw new BadRequestException(
        `Failed to fetch submissions: ${error.message}`,
      );
    }

    return data || [];
  }

  async getProjectSubmissions(projectId: string, instructorId: string) {
    const supabase = this.getSupabaseClient();

    // Verify instructor owns this project
    const { data: project } = await supabase
      .from("projects")
      .select("instructor_id")
      .eq("id", projectId)
      .single();

    if (!project || project.instructor_id !== instructorId) {
      throw new BadRequestException(
        "You can only view submissions for your own projects",
      );
    }

    const { data, error } = await supabase
      .from("project_submissions")
      .select(
        `
        *,
        student:student_id(id, full_name, email, profile_picture),
        comments:project_comments(*)
      `,
      )
      .eq("project_id", projectId)
      .order("submitted_at", { ascending: false });

    if (error) {
      throw new BadRequestException(
        `Failed to fetch submissions: ${error.message}`,
      );
    }

    return data || [];
  }

  async getSubmissionById(submissionId: string) {
    const supabase = this.getSupabaseClient();

    const { data: submission, error } = await supabase
      .from("project_submissions")
      .select(
        `
        *,
        project:project_id(*),
        student:student_id(id, full_name, email, profile_picture),
        grader:graded_by(id, full_name, email),
        comments:project_comments(*, user:user_id(id, full_name, profile_picture))
      `,
      )
      .eq("id", submissionId)
      .single();

    if (error || !submission) {
      throw new NotFoundException("Submission not found");
    }

    return submission;
  }

  // ==================== GRADING ====================

  async gradeSubmission(submissionId: string, gradeDto: GradeSubmissionDto) {
    const supabase = this.getSupabaseClient();

    // Fetch student + course BEFORE updating so we can check the certificate after
    const { data: preFetch, error: fetchErr } = await supabase
      .from("project_submissions")
      .select(`
        id,
        student_id,
        project:project_id(course_id)
      `)
      .eq("id", submissionId)
      .single();

    if (fetchErr || !preFetch) {
      throw new NotFoundException("Submission not found");
    }

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
      throw new BadRequestException(
        `Failed to grade submission: ${error.message}`,
      );
    }

    // After grading, check if this unlocks the certificate
    const courseId = (preFetch as any).project?.course_id;
    if (courseId && preFetch.student_id) {
      try {
        await this.certificatesService.maybeIssueCertificate(
          preFetch.student_id,
          courseId,
        );
      } catch (err: any) {
        this.logger.warn(
          `Certificate check after grading failed: ${err?.message ?? err}`,
        );
      }
    }

    return {
      success: true,
      message: "Submission graded successfully",
      submission,
    };
  }

  async requestResubmission(
    submissionId: string,
    instructorId: string,
    feedback: string,
  ) {
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
      throw new BadRequestException(
        `Failed to request resubmission: ${error.message}`,
      );
    }

    return {
      success: true,
      message: "Resubmission requested",
      submission: data,
    };
  }

  // ==================== COMMENTS ====================

  async addComment(commentDto: AddCommentDto, attachments?: MulterFile[]) {
    const supabase = this.getSupabaseClient();

    // Upload attachments if any
    const uploadedAttachments = [];
    if (attachments && attachments.length > 0) {
      for (const file of attachments) {
        const uploadResult = await this.cloudinaryService.uploadFile(
          file.buffer,
          {
            folder: `project-comments/${commentDto.submission_id}`,
            public_id: `${uuidv4()}-${file.originalname}`,
          },
        );
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
      .select(
        `
        *,
        user:user_id(id, full_name, email, profile_picture)
      `,
      )
      .single();

    if (error) {
      throw new BadRequestException(`Failed to add comment: ${error.message}`);
    }

    return data;
  }

  async getComments(submissionId: string) {
    const supabase = this.getSupabaseClient();

    const { data, error } = await supabase
      .from("project_comments")
      .select(
        `
        *,
        user:user_id(id, full_name, email, profile_picture)
      `,
      )
      .eq("submission_id", submissionId)
      .order("created_at", { ascending: true });

    if (error) {
      throw new BadRequestException(
        `Failed to fetch comments: ${error.message}`,
      );
    }

    return data || [];
  }

  // ==================== STATISTICS ====================

  async getProjectStats(projectId: string, instructorId: string) {
    const supabase = this.getSupabaseClient();

    // Verify ownership
    const { data: project } = await supabase
      .from("projects")
      .select("instructor_id")
      .eq("id", projectId)
      .single();

    if (!project || project.instructor_id !== instructorId) {
      throw new BadRequestException("Unauthorized");
    }

    const { data: submissions } = await supabase
      .from("project_submissions")
      .select("grade, status, is_late")
      .eq("project_id", projectId);

    const totalSubmissions = submissions?.length || 0;
    const gradedCount =
      submissions?.filter((s) => s.status === "graded").length || 0;
    const lateCount = submissions?.filter((s) => s.is_late).length || 0;
    const grades =
      submissions?.filter((s) => s.grade !== null).map((s) => s.grade) || [];
    const averageGrade =
      grades.length > 0 ? grades.reduce((a, b) => a + b, 0) / grades.length : 0;

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

  async getStudentProjectDeadline(projectId: string, studentId: string) {
    const supabase = this.getSupabaseClient();
  
    // Get project + course_id
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, course_id, due_date")
      .eq("id", projectId)
      .single();
  
    if (projectError || !project) {
      throw new NotFoundException("Project not found");
    }
  
    // Get student's enrollment + completion date
    const { data: enrollment } = await supabase
      .from("course_enrollments")
      .select("completed_at")
      .eq("user_id", studentId)
      .eq("course_id", project.course_id)
      .maybeSingle();
  
    let deadline: string | null = null;
    let source: "course_completion" | "instructor_default" | "none" = "none";
  
    if (enrollment?.completed_at) {
      const d = new Date(
        new Date(enrollment.completed_at).getTime() + 21 * 24 * 60 * 60 * 1000,
      );
      deadline = d.toISOString();
      source = "course_completion";
    } else if (project.due_date) {
      deadline = new Date(project.due_date).toISOString();
      source = "instructor_default";
    }
  
    return {
      project_id: projectId,
      student_id: studentId,
      deadline,
      source,
      course_completed: !!enrollment?.completed_at,
      course_completed_at: enrollment?.completed_at ?? null,
    };
  }

    // ==================== AI GRADING ====================

    async aiGradeSubmission(submissionId: string, instructorId: string) {
      const supabase = this.getSupabaseClient();
  
      const { data: submission, error: fetchErr } = await supabase
        .from("project_submissions")
        .select(
          `
          *,
          project:project_id(id, title, description, instructions, rubric, points_possible, instructor_id)
        `,
        )
        .eq("id", submissionId)
        .single();
  
      if (fetchErr || !submission) {
        throw new NotFoundException("Submission not found");
      }
  
      const project = (submission as any).project;
      if (!project || project.instructor_id !== instructorId) {
        throw new BadRequestException(
          "You can only grade submissions for your own projects",
        );
      }
  
      // Mark pending
      await supabase
        .from("project_submissions")
        .update({ ai_grade_status: "pending" })
        .eq("id", submissionId);
  
      try {
        const result = await this.aiAssistantService.gradeProjectSubmission({
          projectBrief: {
            title: project.title,
            description: project.description,
            instructions: project.instructions,
            rubric: project.rubric,
            pointsPossible: project.points_possible ?? 100,
          },
          studentDescription: submission.description ?? "",
          screenshotUrls: Array.isArray(submission.screenshot_urls)
            ? submission.screenshot_urls
            : [],
          submissionUrl: submission.submission_url ?? undefined,
        });
  
        const { data: updated, error: updateErr } = await supabase
          .from("project_submissions")
          .update({
            ai_score: result.score,
            ai_feedback: result.feedback,
            ai_rubric: result.rubric_breakdown,
            ai_graded_at: new Date().toISOString(),
            ai_grade_status: "completed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", submissionId)
          .select()
          .single();
  
        if (updateErr) {
          throw new BadRequestException(updateErr.message);
        }
  
        this.logger.log(
          `AI graded submission ${submissionId}: ${result.score}/${project.points_possible}`,
        );
  
        return { success: true, submission: updated };
      } catch (err: any) {
        await supabase
          .from("project_submissions")
          .update({ ai_grade_status: "failed" })
          .eq("id", submissionId);
  
        this.logger.error(`AI grading failed: ${err.message}`);
        throw new BadRequestException(`AI grading failed: ${err.message}`);
      }
    }
}
