import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
  ForbiddenException,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { ProjectsService } from "./projects.service";
import {
  CreateProjectDto,
  UpdateProjectDto,
  SubmitProjectDto,
  GradeSubmissionDto,
  AddCommentDto,
} from "./dto/project.dto";
import { SupabaseAuthGuard } from "../auth/supabase-auth.guard";
import { InstructorGuard } from "../auth/instructor.guard";
import { CurrentUser } from "../auth/current-user.decorator";

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

type AuthUser = { id: string; email?: string; role?: string };

@Controller("api/projects")
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // ==================== PROJECT MANAGEMENT ====================

  @Post()
  @UseGuards(SupabaseAuthGuard, InstructorGuard)
  async createProject(
    @Body() createDto: CreateProjectDto,
    @CurrentUser() user: AuthUser,
  ) {
    // Force instructor_id to the authenticated user, ignore whatever was in the body
    return this.projectsService.createProject({
      ...createDto,
      instructor_id: user.id,
    });
  }

  @Get()
  async getAllProjects(
    @Query("course_id") course_id?: string,
    @Query("instructor_id") instructor_id?: string,
    @Query("is_active") is_active?: boolean,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.projectsService.getAllProjects({
      course_id,
      instructor_id,
      is_active,
      page: page ? +page : 1,
      limit: limit ? +limit : 20,
    });
  }

  @Get("deadline/:projectId/:studentId")
  @UseGuards(SupabaseAuthGuard)
  async getStudentProjectDeadline(
    @Param("projectId") projectId: string,
    @Param("studentId") studentId: string,
    @CurrentUser() user: AuthUser,
  ) {
    if (user.id !== studentId && user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
      throw new ForbiddenException("You can only view your own deadline");
    }
    return this.projectsService.getStudentProjectDeadline(projectId, studentId);
  }

  // Specific literal routes — all must come before @Get(":id")
  @Get("student/:studentId/submissions")
  @UseGuards(SupabaseAuthGuard)
  async getStudentSubmissions(
    @Param("studentId") studentId: string,
    @CurrentUser() user: AuthUser,
    @Query("project_id") projectId?: string,
  ) {
    if (user.id !== studentId && user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
      throw new ForbiddenException("You can only view your own submissions");
    }
    return this.projectsService.getStudentSubmissions(studentId, projectId);
  }

  @Get("project/:projectId/submissions")
  @UseGuards(SupabaseAuthGuard, InstructorGuard)
  async getProjectSubmissions(
    @Param("projectId") projectId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.projectsService.getProjectSubmissions(projectId, user.id);
  }

  @Get("submissions/:submissionId")
  @UseGuards(SupabaseAuthGuard)
  async getSubmissionById(
    @Param("submissionId") submissionId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.projectsService.getSubmissionById(submissionId, user.id);
  }

  @Get("submissions/:submissionId/comments")
  @UseGuards(SupabaseAuthGuard)
  async getComments(
    @Param("submissionId") submissionId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.projectsService.getComments(submissionId, user.id);
  }

  @Get(":projectId/stats")
  @UseGuards(SupabaseAuthGuard, InstructorGuard)
  async getProjectStats(
    @Param("projectId") projectId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.projectsService.getProjectStats(projectId, user.id);
  }

  // ⚠️ Catch-all for project IDs — MUST be last among the GET routes.
  @Get(":id")
  async getProjectById(@Param("id") id: string) {
    return this.projectsService.getProjectById(id);
  }

  // ==================== SUBMISSIONS ====================

  @Post("submit")
  @UseGuards(SupabaseAuthGuard)
  @UseInterceptors(FilesInterceptor("files", 10))
  async submitProject(
    @UploadedFiles() files: MulterFile[],
    @Body() submitDto: SubmitProjectDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.projectsService.submitProject(submitDto, user.id, files);
  }

  @Post("submissions/:submissionId/ai-grade")
  @UseGuards(SupabaseAuthGuard, InstructorGuard)
  async aiGradeSubmission(
    @Param("submissionId") submissionId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.projectsService.aiGradeSubmission(submissionId, user.id);
  }

  @Get("instructor/:instructorId/submissions")
  @UseGuards(SupabaseAuthGuard, InstructorGuard)
  async getInstructorSubmissions(
    @Param("instructorId") instructorIdFromUrl: string,
    @CurrentUser() user: AuthUser,
    @Query("status") status?: "pending" | "graded" | "all",
    @Query("courseId") courseId?: string,
  ) {
    const role = (user.role ?? "").toUpperCase();
    const isAdmin = role === "ADMIN" || role === "SUPERADMIN";


    const actualInstructorId = isAdmin ? instructorIdFromUrl : user.id;

    return this.projectsService.getInstructorSubmissions(actualInstructorId, {
      status,
      courseId,
    });
  }

  // ==================== MUTATIONS ====================

  @Put(":id")
  @UseGuards(SupabaseAuthGuard, InstructorGuard)
  async updateProject(
    @Param("id") id: string,
    @CurrentUser() user: AuthUser,
    @Body() updateDto: UpdateProjectDto,
  ) {
    return this.projectsService.updateProject(id, user.id, updateDto);
  }

  @Delete(":id")
  @UseGuards(SupabaseAuthGuard, InstructorGuard)
  async deleteProject(
    @Param("id") id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.projectsService.deleteProject(id, user.id);
  }

  @Put("submissions/:submissionId/grade")
  @UseGuards(SupabaseAuthGuard, InstructorGuard)
  async gradeSubmission(
    @Param("submissionId") submissionId: string,
    @Body() gradeDto: GradeSubmissionDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.projectsService.gradeSubmission(submissionId, user.id, gradeDto);
  }

  @Post("submissions/:submissionId/resubmit")
  @UseGuards(SupabaseAuthGuard, InstructorGuard)
  async requestResubmission(
    @Param("submissionId") submissionId: string,
    @Body("feedback") feedback: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.projectsService.requestResubmission(
      submissionId,
      user.id,
      feedback,
    );
  }

  // ==================== COMMENTS ====================

  @Post("comments")
  @UseGuards(SupabaseAuthGuard)
  @UseInterceptors(FilesInterceptor("attachments", 5))
  async addComment(
    @UploadedFiles() files: MulterFile[],
    @Body() commentDto: AddCommentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.projectsService.addComment(commentDto, user.id, files);
  }
}