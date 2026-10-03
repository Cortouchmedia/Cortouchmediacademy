// src/ai/ai-assistant.service.ts
import {
  Injectable,
  Logger,
  BadRequestException,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AiAssistantService implements OnModuleInit {
  private readonly logger = new Logger(AiAssistantService.name);
  private apiKey: string;
  private baseUrl = "https://generativelanguage.googleapis.com/v1beta";

  constructor(
    private configService: ConfigService,
    private supabaseService: SupabaseService,
  ) {}

  async onModuleInit() {
    this.apiKey = this.configService.get<string>("GEMINI_API_KEY");
    if (!this.apiKey) {
      this.logger.error("GEMINI_API_KEY not found in environment variables");
      throw new Error("GEMINI_API_KEY is required");
    }
    this.logger.log("AI Assistant initialized");
  }

  async askQuestion(askQuestionDto: any) {
    const { question, course_id, user_id } = askQuestionDto;

    this.logger.log(`User ${user_id} asking: ${question}`);

    try {
      const courseContent = await this.getCourseContent(course_id);
      const userProgress = await this.getUserProgress(user_id, course_id);

      const prompt = `
        You are a helpful tutor. Answer the student's question based on the course content.
        
        Course Content:
        ${courseContent}
        
        Student Progress: ${userProgress}
        
        Student Question: ${question}
        
        Provide a clear, helpful, and concise answer.
      `;

      const response = await this.callGeminiAPI(prompt);

      return {
        success: true,
        question,
        answer: response,
        timestamp: new Date(),
      };
    } catch (error: any) {
      this.logger.error(`Gemini API error: ${error.message}`);
      throw new BadRequestException(`Failed to get response: ${error.message}`);
    }
  }

  async generateQuiz(generateQuizDto: any) {
    const { course_id, topic, num_questions = 5 } = generateQuizDto;

    try {
      const courseContent = await this.getCourseContent(course_id);

      const prompt = `
        Generate ${num_questions} multiple-choice questions about "${topic || "this course"}".
        
        Course Content:
        ${courseContent}
        
        Return ONLY valid JSON in this exact format (no other text):
        {
          "questions": [
            {
              "question": "question text here",
              "options": ["A) option 1", "B) option 2", "C) option 3", "D) option 4"],
              "correct_answer": "A",
              "explanation": "why this is correct"
            }
          ]
        }
      `;

      const response = await this.callGeminiAPI(prompt);

      let quizData;
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          quizData = JSON.parse(jsonMatch[0]);
        } else {
          quizData = JSON.parse(response);
        }
      } catch {
        quizData = { questions: [] };
      }

      return {
        success: true,
        quiz: quizData,
        total_questions: num_questions,
      };
    } catch (error: any) {
      this.logger.error(`Quiz generation error: ${error.message}`);
      throw new BadRequestException(
        `Failed to generate quiz: ${error.message}`,
      );
    }
  }

  async explainConcept(explainConceptDto: any) {
    const { concept, course_id, level = "intermediate" } = explainConceptDto;

    try {
      const courseContent = await this.getCourseContent(course_id);

      const prompt = `
        Explain the concept "${concept}" at a ${level} level.
        
        Course Context:
        ${courseContent}
        
        Provide a response with:
        1. A simple definition (1 sentence)
        2. Key points to understand (3-5 bullet points)
        3. A practical example
        4. Common misconceptions to avoid
      `;

      const response = await this.callGeminiAPI(prompt);

      return {
        success: true,
        concept,
        explanation: response,
        level,
      };
    } catch (error: any) {
      this.logger.error(`Concept explanation error: ${error.message}`);
      throw new BadRequestException(
        `Failed to explain concept: ${error.message}`,
      );
    }
  }

  async generateSummary(generateSummaryDto: any) {
    const { course_id } = generateSummaryDto;

    try {
      const courseContent = await this.getCourseContent(course_id);

      const prompt = `
        Create a comprehensive summary of this course:
        
        ${courseContent}
        
        Provide:
        1. A brief overview (2-3 sentences)
        2. Key takeaways (bullet points)
        3. Important concepts covered
        4. Recommended next steps for students
      `;

      const response = await this.callGeminiAPI(prompt);

      return {
        success: true,
        summary: response,
        generated_at: new Date(),
      };
    } catch (error: any) {
      this.logger.error(`Summary generation error: ${error.message}`);
      throw new BadRequestException(
        `Failed to generate summary: ${error.message}`,
      );
    }
  }

  async suggestResources(suggestResourcesDto: any) {
    const { course_id, topic, limit = 5 } = suggestResourcesDto;

    try {
      const courseContent = await this.getCourseContent(course_id);

      const prompt = `
        Suggest ${limit} learning resources for "${topic}" based on this course:
        
        Course Content:
        ${courseContent}
        
        Return ONLY valid JSON array in this format (no other text):
        [
          {
            "title": "Resource title",
            "type": "video|article|documentation|exercise|project",
            "description": "Brief description",
            "why_helpful": "Why this resource is useful",
            "estimated_time": "1 hour"
          }
        ]
      `;

      const response = await this.callGeminiAPI(prompt);

      let resources;
      try {
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          resources = JSON.parse(jsonMatch[0]);
        } else {
          resources = JSON.parse(response);
        }
      } catch {
        resources = [];
      }

      return {
        success: true,
        topic,
        resources: resources.slice(0, limit),
      };
    } catch (error: any) {
      this.logger.error(`Resource suggestion error: ${error.message}`);
      throw new BadRequestException(
        `Failed to suggest resources: ${error.message}`,
      );
    }
  }

  async gradeProjectSubmission(input: {
    projectBrief: {
      title: string;
      description: string;
      instructions?: string;
      rubric?: any;
      pointsPossible?: number;
    };
    studentDescription: string;
    screenshotUrls: string[];
    submissionUrl?: string;
  }): Promise<{
    score: number;
    feedback: string;
    rubric_breakdown: Array<{
      criterion: string;
      awarded: number;
      max: number;
      notes: string;
    }>;
  }> {
    const points = input.projectBrief.pointsPossible ?? 100;

    let prompt = `You are an expert project grader. Evaluate the student's submission below.

PROJECT BRIEF
Title: ${input.projectBrief.title}
Description: ${input.projectBrief.description}
${input.projectBrief.instructions ? `Instructions: ${input.projectBrief.instructions}` : ""}
${input.projectBrief.rubric ? `Rubric: ${JSON.stringify(input.projectBrief.rubric)}` : ""}
Points possible: ${points}

STUDENT'S WRITTEN DESCRIPTION
${input.studentDescription}
`;

    if (input.submissionUrl) {
      prompt += `\nSUBMISSION URL\n${input.submissionUrl}\n`;
    }

    prompt += `
    You are being given ${input.screenshotUrls.length} screenshot(s) of the student's work.
    
    TASK
    Grade this submission. Reference what you actually see in the screenshots.
    
    IMPORTANT OUTPUT CONSTRAINTS:
    - Total response must be under 400 words.
    - "feedback": 2 short paragraphs, max 120 words total. No long essays.
    - "rubric_breakdown": max 4 criteria, one sentence each.
    - Keep everything compact so the JSON does not get truncated.
    
    Return ONLY valid JSON, no other text, in this exact shape:
    {
      "score": <number from 0 to ${points}>,
      "feedback": "<2 short paragraphs, max 120 words>",
      "rubric_breakdown": [
        { "criterion": "<short name>", "awarded": <number>, "max": <number>, "notes": "<one short sentence>" }
      ]
    }
    `;

    const parts: any[] = [{ text: prompt }];

    for (const url of input.screenshotUrls.slice(0, 5)) {
      try {
        const imgResponse = await fetch(url);
        if (!imgResponse.ok) {
          this.logger.warn(`Failed to fetch image ${url}: HTTP ${imgResponse.status}`);
          continue;
        }
        const arrayBuffer = await imgResponse.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        const contentType = imgResponse.headers.get("content-type") || "image/png";

        parts.push({
          inline_data: {
            mime_type: contentType,
            data: base64,
          },
        });
      } catch (err: any) {
        this.logger.warn(`Failed to fetch screenshot ${url}: ${err.message}`);
      }
    }

    const modelNames = [
      "models/gemini-3.8-flash",        
      "models/gemini-flash-latest",   
    ];

    let lastError: Error | null = null;

    for (const modelName of modelNames) {
      try {
        this.logger.log(`Grading with model: ${modelName}`);

        const url = `${this.baseUrl}/${modelName}:generateContent?key=${this.apiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 8192,
            },
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          this.logger.warn(
            `Grade model ${modelName} failed: ${response.status} ${errText}`,
          );
          lastError = new Error(`HTTP ${response.status}`);
          continue;
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          lastError = new Error("No text from model");
          continue;
        }

                // 1. Strip markdown fences if present
                let cleanText = text.trim();
                if (cleanText.startsWith("```")) {
                  cleanText = cleanText
                    .replace(/^```(?:json)?\s*/i, "")
                    .replace(/\s*```\s*$/, "")
                    .trim();
                }
        
                // 2. Try strict parse first, then fall back to regex extraction
                let parsed: any = null;
                try {
                  parsed = JSON.parse(cleanText);
                } catch {
                  const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
                  if (jsonMatch) {
                    try {
                      parsed = JSON.parse(jsonMatch[0]);
                    } catch (innerErr: any) {
                      this.logger.warn(
                        `JSON regex fallback also failed: ${innerErr.message}`,
                      );
                    }
                  }
                }
        
                // 3. If we still don't have valid JSON, log the raw response for debugging
                if (!parsed || typeof parsed !== "object") {
                  this.logger.warn(
                    `Model returned non-JSON output (length ${text.length}). First 500 chars: ${text.substring(0, 500)}`,
                  );
                  lastError = new Error("Model returned non-JSON output");
                  continue;
                }
        
                return {
                  score: Math.max(0, Math.min(points, Number(parsed.score) || 0)),
                  feedback: String(parsed.feedback || "No feedback provided."),
                  rubric_breakdown: Array.isArray(parsed.rubric_breakdown)
                    ? parsed.rubric_breakdown
                    : [],
                };
      } catch (err: any) {
        this.logger.warn(`Grade error with ${modelName}: ${err.message}`);
        lastError = err;
      }
    }

    throw lastError || new Error("AI grading failed for all models");
  }

  // ==================== HELPER METHODS ====================

  private async callGeminiAPI(prompt: string): Promise<string> {
    // Try different model names (order by preference)
    const modelNames = [
      "models/gemini-3.8-flash",        // current generation
      "models/gemini-flash-latest",     // fallback alias
    ];

    let lastError: Error | null = null;

    for (const modelName of modelNames) {
      try {
        this.logger.log(`Trying model: ${modelName}`);

        const url = `${this.baseUrl}/${modelName}:generateContent?key=${this.apiKey}`;

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          this.logger.warn(
            `Model ${modelName} failed: ${response.status} - ${errorText}`,
          );
          lastError = new Error(`HTTP ${response.status}: ${errorText}`);
          continue;
        }

        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (generatedText) {
          this.logger.log(`Successfully used model: ${modelName}`);
          return generatedText;
        }

        lastError = new Error("No text generated from model");
      } catch (error: any) {
        this.logger.warn(`Error with model ${modelName}: ${error.message}`);
        lastError = error;
      }
    }

    throw lastError || new Error("No working Gemini model found");
  }

  private async getCourseContent(courseId: string): Promise<string> {
    const supabase = this.supabaseService.getAdminClient();

    const { data: course } = await supabase
      .from("courses")
      .select("title, description")
      .eq("id", courseId)
      .single();

    const { data: modules } = await supabase
      .from("course_modules")
      .select(
        `
        title,
        lessons:course_lessons(title, description, text_content)
      `,
      )
      .eq("course_id", courseId);

    let content = `Course: ${course?.title || "Unknown"}\n`;
    content += `Description: ${course?.description || ""}\n\n`;

    for (const module of modules || []) {
      content += `\nModule: ${module.title}\n`;
      for (const lesson of module.lessons || []) {
        content += `  Lesson: ${lesson.title}\n`;
        content += `  ${lesson.text_content?.substring(0, 300) || ""}\n`;
      }
    }

    return content.substring(0, 8000);
  }

  private async getUserProgress(
    userId: string,
    courseId: string,
  ): Promise<string> {
    const supabase = this.supabaseService.getAdminClient();

    const { data: progress } = await supabase
      .from("course_enrollments")
      .select("progress_percentage")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .maybeSingle();

    if (progress) {
      return `${progress.progress_percentage}% complete`;
    }
    return "Not enrolled";
  }
}
