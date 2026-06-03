export declare class CreateProjectDto {
    course_id: string;
    instructor_id: string;
    title: string;
    description: string;
    instructions?: string;
    requirements?: any[];
    due_date?: Date;
    max_file_size?: number;
    allowed_file_types?: string[];
    max_submissions?: number;
    points_possible?: number;
    rubric?: any;
}
export declare class UpdateProjectDto {
    title?: string;
    description?: string;
    instructions?: string;
    requirements?: any[];
    due_date?: Date;
    max_file_size?: number;
    allowed_file_types?: string[];
    max_submissions?: number;
    points_possible?: number;
    rubric?: any;
    is_active?: boolean;
}
export declare class SubmitProjectDto {
    project_id: string;
    student_id: string;
    title?: string;
    description?: string;
    files?: any[];
    submission_url?: string;
}
export declare class GradeSubmissionDto {
    grade: number;
    feedback: string;
    instructor_id: string;
}
export declare class AddCommentDto {
    submission_id: string;
    user_id: string;
    comment: string;
    attachments?: any[];
}
