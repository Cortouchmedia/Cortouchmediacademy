// src/projects/projects.controller.ts
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
  BadRequestException,
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

// Define Multer file interface locally
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Controller("api/projects")
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // ==================== PROJECT MANAGEMENT ====================

  @Post()
  async createProject(@Body() createDto: CreateProjectDto) {
    return this.projectsService.createProject(createDto);
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

  @Get(":id")
  async getProjectById(@Param("id") id: string) {
    return this.projectsService.getProjectById(id);
  }

  @Put(":id")
  async updateProject(
    @Param("id") id: string,
    @Query("instructorId") instructorId: string,
    @Body() updateDto: UpdateProjectDto,
  ) {
    return this.projectsService.updateProject(id, instructorId, updateDto);
  }

  @Delete(":id")
  async deleteProject(
    @Param("id") id: string,
    @Query("instructorId") instructorId: string,
  ) {
    return this.projectsService.deleteProject(id, instructorId);
  }

  // ==================== SUBMISSIONS ====================

  @Post("submit")
  @UseInterceptors(FilesInterceptor("files", 10))
  async submitProject(
    @UploadedFiles() files: MulterFile[],
    @Body() submitDto: SubmitProjectDto,
  ) {
    return this.projectsService.submitProject(submitDto, files);
  }

  @Get("student/:studentId/submissions")
  async getStudentSubmissions(
    @Param("studentId") studentId: string,
    @Query("project_id") projectId?: string,
  ) {
    return this.projectsService.getStudentSubmissions(studentId, projectId);
  }

  @Get("project/:projectId/submissions")
  async getProjectSubmissions(
    @Param("projectId") projectId: string,
    @Query("instructorId") instructorId: string,
  ) {
    return this.projectsService.getProjectSubmissions(projectId, instructorId);
  }

  @Get("submissions/:submissionId")
  async getSubmissionById(@Param("submissionId") submissionId: string) {
    return this.projectsService.getSubmissionById(submissionId);
  }

  // ==================== GRADING ====================

  @Put("submissions/:submissionId/grade")
  async gradeSubmission(
    @Param("submissionId") submissionId: string,
    @Body() gradeDto: GradeSubmissionDto,
  ) {
    return this.projectsService.gradeSubmission(submissionId, gradeDto);
  }

  @Post("submissions/:submissionId/resubmit")
  async requestResubmission(
    @Param("submissionId") submissionId: string,
    @Query("instructorId") instructorId: string,
    @Body("feedback") feedback: string,
  ) {
    return this.projectsService.requestResubmission(
      submissionId,
      instructorId,
      feedback,
    );
  }

  // ==================== COMMENTS ====================

  @Post("comments")
  @UseInterceptors(FilesInterceptor("attachments", 5))
  async addComment(
    @UploadedFiles() files: MulterFile[],
    @Body() commentDto: AddCommentDto,
  ) {
    return this.projectsService.addComment(commentDto, files);
  }

  @Get("submissions/:submissionId/comments")
  async getComments(@Param("submissionId") submissionId: string) {
    return this.projectsService.getComments(submissionId);
  }

  // ==================== STATISTICS ====================

  @Get(":projectId/stats")
  async getProjectStats(
    @Param("projectId") projectId: string,
    @Query("instructorId") instructorId: string,
  ) {
    return this.projectsService.getProjectStats(projectId, instructorId);
  }
}
