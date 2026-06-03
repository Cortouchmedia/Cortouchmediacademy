import { OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SupabaseService } from "../../supabase.service";
export declare class AiAssistantService implements OnModuleInit {
    private configService;
    private supabaseService;
    private readonly logger;
    private apiKey;
    private baseUrl;
    constructor(configService: ConfigService, supabaseService: SupabaseService);
    onModuleInit(): Promise<void>;
    askQuestion(askQuestionDto: any): Promise<{
        success: boolean;
        question: any;
        answer: string;
        timestamp: Date;
    }>;
    generateQuiz(generateQuizDto: any): Promise<{
        success: boolean;
        quiz: any;
        total_questions: any;
    }>;
    explainConcept(explainConceptDto: any): Promise<{
        success: boolean;
        concept: any;
        explanation: string;
        level: any;
    }>;
    generateSummary(generateSummaryDto: any): Promise<{
        success: boolean;
        summary: string;
        generated_at: Date;
    }>;
    suggestResources(suggestResourcesDto: any): Promise<{
        success: boolean;
        topic: any;
        resources: any;
    }>;
    private callGeminiAPI;
    private getCourseContent;
    private getUserProgress;
}
