// src/ai/ai-assistant.controller.ts
import { Controller, Post, Body, Get, Param, Query } from "@nestjs/common";
import { ConfigService } from "@nestjs/config"; // Add this import
import { AiAssistantService } from "./ai-assistant.service";

export class AskQuestionDto {
  question: string;
  course_id: string;
  user_id: string;
}

export class GenerateQuizDto {
  course_id: string;
  topic?: string;
  num_questions?: number;
  difficulty?: string;
}

export class ExplainConceptDto {
  concept: string;
  course_id: string;
  level?: string;
}

export class GenerateSummaryDto {
  course_id: string;
  module_id?: string;
  lesson_id?: string;
}

export class SuggestResourcesDto {
  course_id: string;
  topic: string;
  limit?: number;
}

@Controller("api/ai")
export class AiAssistantController {
  constructor(
    private readonly aiAssistantService: AiAssistantService,
    private readonly configService: ConfigService, // Add this
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

      // Filter models that support generateContent
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
