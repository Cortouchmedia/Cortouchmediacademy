"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiAssistantController = exports.SuggestResourcesDto = exports.GenerateSummaryDto = exports.ExplainConceptDto = exports.GenerateQuizDto = exports.AskQuestionDto = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ai_assistant_service_1 = require("./ai-assistant.service");
class AskQuestionDto {
}
exports.AskQuestionDto = AskQuestionDto;
class GenerateQuizDto {
}
exports.GenerateQuizDto = GenerateQuizDto;
class ExplainConceptDto {
}
exports.ExplainConceptDto = ExplainConceptDto;
class GenerateSummaryDto {
}
exports.GenerateSummaryDto = GenerateSummaryDto;
class SuggestResourcesDto {
}
exports.SuggestResourcesDto = SuggestResourcesDto;
let AiAssistantController = class AiAssistantController {
    constructor(aiAssistantService, configService) {
        this.aiAssistantService = aiAssistantService;
        this.configService = configService;
    }
    async healthCheck() {
        return { status: "ok", message: "AI Assistant is running" };
    }
    async askQuestion(askQuestionDto) {
        return this.aiAssistantService.askQuestion(askQuestionDto);
    }
    async generateQuiz(generateQuizDto) {
        return this.aiAssistantService.generateQuiz(generateQuizDto);
    }
    async explainConcept(explainConceptDto) {
        return this.aiAssistantService.explainConcept(explainConceptDto);
    }
    async generateSummary(generateSummaryDto) {
        return this.aiAssistantService.generateSummary(generateSummaryDto);
    }
    async suggestResources(suggestResourcesDto) {
        return this.aiAssistantService.suggestResources(suggestResourcesDto);
    }
    async listAvailableModels() {
        const apiKey = this.configService.get("GEMINI_API_KEY");
        if (!apiKey) {
            return { error: "GEMINI_API_KEY not configured" };
        }
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            const data = await response.json();
            if (data.error) {
                return { error: data.error };
            }
            const generateContentModels = data.models
                ?.filter((model) => model.supportedGenerationMethods?.includes("generateContent"))
                .map((model) => model.name);
            return {
                success: true,
                all_models: data.models?.map((m) => m.name),
                generateContent_models: generateContentModels,
                model_details: data.models?.map((m) => ({
                    name: m.name,
                    display_name: m.displayName,
                    supported_methods: m.supportedGenerationMethods,
                })),
            };
        }
        catch (error) {
            return { error: error.message };
        }
    }
};
exports.AiAssistantController = AiAssistantController;
__decorate([
    (0, common_1.Get)("health"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AiAssistantController.prototype, "healthCheck", null);
__decorate([
    (0, common_1.Post)("ask"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AskQuestionDto]),
    __metadata("design:returntype", Promise)
], AiAssistantController.prototype, "askQuestion", null);
__decorate([
    (0, common_1.Post)("quiz/generate"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GenerateQuizDto]),
    __metadata("design:returntype", Promise)
], AiAssistantController.prototype, "generateQuiz", null);
__decorate([
    (0, common_1.Post)("explain"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ExplainConceptDto]),
    __metadata("design:returntype", Promise)
], AiAssistantController.prototype, "explainConcept", null);
__decorate([
    (0, common_1.Post)("summary"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GenerateSummaryDto]),
    __metadata("design:returntype", Promise)
], AiAssistantController.prototype, "generateSummary", null);
__decorate([
    (0, common_1.Post)("resources"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SuggestResourcesDto]),
    __metadata("design:returntype", Promise)
], AiAssistantController.prototype, "suggestResources", null);
__decorate([
    (0, common_1.Get)("list-models"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AiAssistantController.prototype, "listAvailableModels", null);
exports.AiAssistantController = AiAssistantController = __decorate([
    (0, common_1.Controller)("api/ai"),
    __metadata("design:paramtypes", [ai_assistant_service_1.AiAssistantService,
        config_1.ConfigService])
], AiAssistantController);
//# sourceMappingURL=ai-assistant.controller.js.map