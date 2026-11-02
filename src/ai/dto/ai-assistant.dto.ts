// src/ai/dto/ai-assistant.dto.ts
export class AskQuestionDto {
  question: string;
  course_id: string;
  user_id: string;
  context?: {
    current_lesson?: string;
    previous_messages?: Array<{ role: string; content: string }>;
  };
}

export class GenerateQuizDto {
  course_id: string;
  topic?: string;
  num_questions?: number;
  difficulty?: "easy" | "medium" | "hard";
}

export class ExplainConceptDto {
  concept: string;
  course_id: string;
  level?: "beginner" | "intermediate" | "advanced";
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
