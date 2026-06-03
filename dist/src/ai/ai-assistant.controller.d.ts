import { ConfigService } from "@nestjs/config";
import { AiAssistantService } from "./ai-assistant.service";
export declare class AskQuestionDto {
    question: string;
    course_id: string;
    user_id: string;
}
export declare class GenerateQuizDto {
    course_id: string;
    topic?: string;
    num_questions?: number;
    difficulty?: string;
}
export declare class ExplainConceptDto {
    concept: string;
    course_id: string;
    level?: string;
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
export declare class AiAssistantController {
    private readonly aiAssistantService;
    private readonly configService;
    constructor(aiAssistantService: AiAssistantService, configService: ConfigService);
    healthCheck(): Promise<{
        status: string;
        message: string;
    }>;
    askQuestion(askQuestionDto: AskQuestionDto): Promise<{
        success: boolean;
        question: any;
        answer: string;
        timestamp: Date;
    }>;
    generateQuiz(generateQuizDto: GenerateQuizDto): Promise<{
        success: boolean;
        quiz: any;
        total_questions: any;
    }>;
    explainConcept(explainConceptDto: ExplainConceptDto): Promise<{
        success: boolean;
        concept: any;
        explanation: string;
        level: any;
    }>;
    generateSummary(generateSummaryDto: GenerateSummaryDto): Promise<{
        success: boolean;
        summary: string;
        generated_at: Date;
    }>;
    suggestResources(suggestResourcesDto: SuggestResourcesDto): Promise<{
        success: boolean;
        topic: any;
        resources: any;
    }>;
    listAvailableModels(): Promise<{
        error: any;
        success?: undefined;
        all_models?: undefined;
        generateContent_models?: undefined;
        model_details?: undefined;
    } | {
        success: boolean;
        all_models: any;
        generateContent_models: any;
        model_details: any;
        error?: undefined;
    }>;
}
