import { ProjectsService } from "./projects.service";
import { CreateProjectDto, UpdateProjectDto, SubmitProjectDto, GradeSubmissionDto, AddCommentDto } from "./dto/project.dto";
interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
}
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    createProject(createDto: CreateProjectDto): Promise<any>;
    getAllProjects(course_id?: string, instructor_id?: string, is_active?: boolean, page?: number, limit?: number): Promise<{
        projects: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getProjectById(id: string): Promise<any>;
    updateProject(id: string, instructorId: string, updateDto: UpdateProjectDto): Promise<any>;
    deleteProject(id: string, instructorId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    submitProject(files: MulterFile[], submitDto: SubmitProjectDto): Promise<{
        success: boolean;
        message: string;
        submission: any;
        isLate: boolean;
    }>;
    getStudentSubmissions(studentId: string, projectId?: string): Promise<any[]>;
    getProjectSubmissions(projectId: string, instructorId: string): Promise<any[]>;
    getSubmissionById(submissionId: string): Promise<any>;
    gradeSubmission(submissionId: string, gradeDto: GradeSubmissionDto): Promise<{
        success: boolean;
        message: string;
        submission: any;
    }>;
    requestResubmission(submissionId: string, instructorId: string, feedback: string): Promise<{
        success: boolean;
        message: string;
        submission: any;
    }>;
    addComment(files: MulterFile[], commentDto: AddCommentDto): Promise<any>;
    getComments(submissionId: string): Promise<any[]>;
    getProjectStats(projectId: string, instructorId: string): Promise<{
        total_submissions: number;
        graded_count: number;
        ungraded_count: number;
        late_count: number;
        average_grade: number;
        grade_distribution: {
            A: number;
            B: number;
            C: number;
            D: number;
            F: number;
        };
    }>;
}
export {};
