export declare class AskQuestionDto {
    question: string;
    course_id: string;
    user_id: string;
    context?: {
        current_lesson?: string;
        previous_messages?: Array<{
            role: string;
            content: string;
        }>;
    };
}
export declare class GenerateQuizDto {
    course_id: string;
    topic?: string;
    num_questions?: number;
    difficulty?: "easy" | "medium" | "hard";
}
export declare class ExplainConceptDto {
    concept: string;
    course_id: string;
    level?: "beginner" | "intermediate" | "advanced";
}
export declare class GenerateSummaryDto {
    course_id: string;
    module_id?: string;
    lesson_id?: string;
}
export declare class SuggestResourcesDto {
    course_id: string;
    topic: string;
    limit?: number;
}
