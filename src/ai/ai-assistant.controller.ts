// src/ai/ai-assistant.controller.ts
import { Controller, Post, Body, Get } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
} from "class-validator";
import { AiAssistantService } from "./ai-assistant.service";

export class AskQuestionDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsOptional()
  course_id?: string;

  @IsString()
  @IsOptional()
  user_id?: string;
}

export class GenerateQuizDto {
  @IsString()
  @IsOptional()
  course_id?: string;

  @IsString()
  @IsOptional()
  topic?: string;

  @IsNumber()
  @IsOptional()
  num_questions?: number;

  @IsString()
  @IsOptional()
  difficulty?: string;
}

export class ExplainConceptDto {
  @IsString()
  @IsNotEmpty()
  concept: string;

  @IsString()
  @IsOptional()
  course_id?: string;

  @IsString()
  @IsOptional()
  level?: string;
}

export class GenerateSummaryDto {
  @IsString()
  @IsNotEmpty()
  course_id: string;

  @IsString()
  @IsOptional()
  module_id?: string;

  @IsString()
  @IsOptional()
  lesson_id?: string;
}

export class SuggestResourcesDto {
  @IsString()
  @IsNotEmpty()
  course_id: string;

  @IsString()
  @IsNotEmpty()
  topic: string;

  @IsNumber()
  @IsOptional()
  limit?: number;
}

@Controller("api/ai")
export class AiAssistantController {
  constructor(
    private readonly aiAssistantService: AiAssistantService,
    private readonly configService: ConfigService,
  ) {}

  @Get("health")
  async healthCheck() {
    return { status: "ok", message: "AI Assistant is running" };
  }

  @Post("ask")
  async askQuestion(@Body() askQuestionDto: AskQuestionDto) {
    return this.aiAssistantService.askQuestion(askQuestionDto);
  }

  @Post("quiz/generate")
  async generateQuiz(@Body() generateQuizDto: GenerateQuizDto) {
    return this.aiAssistantService.generateQuiz(generateQuizDto);
  }

  @Post("explain")
  async explainConcept(@Body() explainConceptDto: ExplainConceptDto) {
    return this.aiAssistantService.explainConcept(explainConceptDto);
  }

  @Post("summary")
  async generateSummary(@Body() generateSummaryDto: GenerateSummaryDto) {
    return this.aiAssistantService.generateSummary(generateSummaryDto);
  }

  @Post("resources")
  async suggestResources(@Body() suggestResourcesDto: SuggestResourcesDto) {
    return this.aiAssistantService.suggestResources(suggestResourcesDto);
  }

  @Get("list-models")
  async listAvailableModels() {
    const apiKey = this.configService.get<string>("GEMINI_API_KEY");

    if (!apiKey) {
      return { error: "GEMINI_API_KEY not configured" };
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      );
      const data = await response.json();

      if (data.error) {
        return { error: data.error };
      }

      const generateContentModels = data.models
        ?.filter((model: any) =>
          model.supportedGenerationMethods?.includes("generateContent"),
        )
        .map((model: any) => model.name);

      return {
        success: true,
        all_models: data.models?.map((m: any) => m.name),
        generateContent_models: generateContentModels,
        model_details: data.models?.map((m: any) => ({
          name: m.name,
          display_name: m.displayName,
          supported_methods: m.supportedGenerationMethods,
        })),
      };
    } catch (error: any) {
      return { error: error.message };
    }
  }
}