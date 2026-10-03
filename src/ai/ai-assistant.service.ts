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
    Grade this submission against the six criteria below. Every criterion must reference something specific from the brief, the student's description, or the screenshots. Do not invent facts you cannot see.
    
    EVALUATION CRITERIA (score each, then sum for the total):
    
    1. Completeness (max 25 pts)
       Cross-check the PROJECT BRIEF above against what's visible in the screenshots. List every requirement from the brief and state whether each one is met. Award points proportionally.
    
    2. Correctness (max 25 pts)
       Does the work appear to function correctly? Look for visible errors, broken layouts, missing states, contradictions with the brief, or unfinished sections.
    
    3. Quality (max 20 pts)
       Is the work polished and well-structured? Consider visual design, code organization (if code is shown), spacing, attention to detail.
    
    4. Student's Description (max 15 pts)
       Did the student clearly explain their approach and challenges? Reward thoughtful, specific write-ups. Penalize vague or one-line descriptions.
    
    5. Screenshot Evidence (max 10 pts)
       Do the screenshots clearly show the finished work? Reward well-lit, relevant, complete captures. Penalize blurry, partial, or off-topic screenshots.
    
    6. Instructions Adherence (max 5 pts)
       Did the student follow the specific instructions in the brief (format, submission method, stated constraints)?
    
    RULES
    - Do not award a score without explaining WHY in "notes". Reference specific things you can see.
    - If a criterion cannot be judged from the screenshots or the description, say so explicitly in "notes" and award a neutral (mid-range) score for that criterion only.
    - Be honest. A weak submission should score low.
    - Total feedback must stay under 400 words.
    
    BAD FEEDBACK (do NOT write like this):
    "The student did a good job. The work looks nice but could be improved."
    
    GOOD FEEDBACK (write like this):
    "The student completed all three requirements from the brief: user login, dashboard view, and logout flow. The login screen (screenshot 1) is clean and well-spaced, and the dashboard (screenshot 2) shows the correct data. The mobile layout in screenshot 3 breaks at the 380px breakpoint though — the sidebar overlaps the main content. The description explains the approach but doesn't mention any challenges, which loses points under criterion 4."
    
    Return ONLY valid JSON, no other text, matching this exact shape:
    {
      "score": <sum of criterion scores, scaled so the maximum is ${points}>,
      "feedback": "<2 short paragraphs, max 120 words. Open with what the student did well, then 1-2 specific improvements.>",
      "rubric_breakdown": [
        { "criterion": "Completeness", "awarded": <0-25>, "max": 25, "notes": "<one short sentence referencing specific requirements from the brief>" },
        { "criterion": "Correctness", "awarded": <0-25>, "max": 25, "notes": "<one short sentence>" },
        { "criterion": "Quality", "awarded": <0-20>, "max": 20, "notes": "<one short sentence>" },
        { "criterion": "Student's Description", "awarded": <0-15>, "max": 15, "notes": "<one short sentence>" },
        { "criterion": "Screenshot Evidence", "awarded": <0-10>, "max": 10, "notes": "<one short sentence>" },
        { "criterion": "Instructions Adherence", "awarded": <0-5>, "max": 5, "notes": "<one short sentence>" }
      ]
    }
    
    SCALING: The six criteria total 100. If points_possible is ${points} and that is not 100, scale the "score" field proportionally so it stays within 0 to ${points}. The rubric_breakdown values should ALWAYS use the maximums shown above (25, 25, 20, 15, 10, 5) — do not scale them.
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
              temperature: 0.2,
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
