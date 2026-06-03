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
exports.WebinarsController = void 0;
const common_1 = require("@nestjs/common");
const webinars_service_1 = require("./webinars.service");
const webinar_dto_1 = require("./dto/webinar.dto");
let WebinarsController = class WebinarsController {
    constructor(webinarsService) {
        this.webinarsService = webinarsService;
    }
    async createWebinar(createWebinarDto) {
        return this.webinarsService.createWebinar(createWebinarDto);
    }
    async getAllWebinars(status, course_id, instructor_id, page, limit) {
        return this.webinarsService.getAllWebinars({
            status,
            course_id,
            instructor_id,
            page: page ? +page : 1,
            limit: limit ? +limit : 20,
        });
    }
    async getUpcomingWebinars(userId, limit) {
        return this.webinarsService.getUpcomingWebinars(userId, limit ? +limit : 10);
    }
    async getLiveWebinars() {
        const result = await this.webinarsService.getLiveWebinars();
        return result;
    }
    async getWebinarById(id) {
        return this.webinarsService.getWebinarById(id);
    }
    async updateWebinar(id, instructorId, updateWebinarDto) {
        return this.webinarsService.updateWebinar(id, instructorId, updateWebinarDto);
    }
    async deleteWebinar(id, instructorId) {
        return this.webinarsService.deleteWebinar(id, instructorId);
    }
    async registerForWebinar(registerDto) {
        if (!registerDto.webinar_id) {
            throw new common_1.BadRequestException("webinar_id is required");
        }
        if (!registerDto.user_id) {
            throw new common_1.BadRequestException("user_id is required");
        }
        return this.webinarsService.registerForWebinar(registerDto);
    }
    async getUserRegistrations(userId) {
        if (!userId) {
            throw new common_1.BadRequestException("userId is required");
        }
        return this.webinarsService.getUserRegistrations(userId);
    }
    async getWebinarRegistrations(webinarId, instructorId) {
        if (!webinarId) {
            throw new common_1.BadRequestException("webinarId is required");
        }
        if (!instructorId) {
            throw new common_1.BadRequestException("instructorId is required");
        }
        return this.webinarsService.getWebinarRegistrations(webinarId, instructorId);
    }
    async markAttendance(webinarId, userId, attended) {
        if (!webinarId) {
            throw new common_1.BadRequestException("webinarId is required");
        }
        if (!userId) {
            throw new common_1.BadRequestException("userId is required");
        }
        if (attended === undefined) {
            throw new common_1.BadRequestException("attended field is required");
        }
        return this.webinarsService.markAttendance(webinarId, userId, attended);
    }
    async submitFeedback(feedbackDto) {
        if (!feedbackDto) {
            throw new common_1.BadRequestException("Request body is required");
        }
        if (!feedbackDto.webinar_id) {
            throw new common_1.BadRequestException("webinar_id is required");
        }
        if (!feedbackDto.user_id) {
            throw new common_1.BadRequestException("user_id is required");
        }
        if (!feedbackDto.rating) {
            throw new common_1.BadRequestException("rating is required");
        }
        if (feedbackDto.rating < 1 || feedbackDto.rating > 5) {
            throw new common_1.BadRequestException("rating must be between 1 and 5");
        }
        return this.webinarsService.submitFeedback(feedbackDto);
    }
    async getWebinarFeedback(webinarId) {
        if (!webinarId) {
            throw new common_1.BadRequestException("webinarId is required");
        }
        return this.webinarsService.getWebinarFeedback(webinarId);
    }
    async sendChatMessage(chatDto) {
        if (!chatDto) {
            throw new common_1.BadRequestException("Request body is required");
        }
        if (!chatDto.webinar_id) {
            throw new common_1.BadRequestException("webinar_id is required");
        }
        if (!chatDto.user_id) {
            throw new common_1.BadRequestException("user_id is required");
        }
        if (!chatDto.message) {
            throw new common_1.BadRequestException("message is required");
        }
        return this.webinarsService.sendChatMessage(chatDto);
    }
    async getChatMessages(webinarId, limit) {
        if (!webinarId) {
            throw new common_1.BadRequestException("webinarId is required");
        }
        return this.webinarsService.getChatMessages(webinarId, limit ? +limit : 50);
    }
    async testFeedback(body) {
        return {
            received: body,
            webinar_id: body?.webinar_id,
            user_id: body?.user_id,
            rating: body?.rating,
            comment: body?.comment,
        };
    }
    async getUserStatus(webinarId, userId) {
        const supabase = this.webinarsService.getSupabaseClient();
        const { data: registration, error } = await supabase
            .from("webinar_registrations")
            .select("*")
            .eq("webinar_id", webinarId)
            .eq("user_id", userId)
            .maybeSingle();
        return {
            is_registered: !!registration,
            registration_data: registration,
            attended: registration?.attended || false,
            error: error?.message,
        };
    }
    async debugAllWebinars() {
        const supabase = this.webinarsService.getSupabaseClient();
        const { data, error } = await supabase.from("webinars").select("*");
        return {
            total: data?.length || 0,
            webinars: data,
            live_count: data?.filter((w) => w.status === "live").length || 0,
            statuses: data?.map((w) => ({
                id: w.id,
                title: w.title,
                status: w.status,
            })),
        };
    }
    async debugLiveCheck() {
        const result = await this.webinarsService.getLiveWebinars();
        return {
            result,
            hasLiveWebinars: result.count > 0,
            message: result.count === 0
                ? "No live webinars found in database"
                : "Live webinars exist",
        };
    }
};
exports.WebinarsController = WebinarsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [webinar_dto_1.CreateWebinarDto]),
    __metadata("design:returntype", Promise)
], WebinarsController.prototype, "createWebinar", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)("status")),
    __param(1, (0, common_1.Query)("course_id")),
    __param(2, (0, common_1.Query)("instructor_id")),
    __param(3, (0, common_1.Query)("page")),
    __param(4, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], WebinarsController.prototype, "getAllWebinars", null);
__decorate([
    (0, common_1.Get)("upcoming"),
    __param(0, (0, common_1.Query)("userId")),
    __param(1, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], WebinarsController.prototype, "getUpcomingWebinars", null);
__decorate([
    (0, common_1.Get)("live"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WebinarsController.prototype, "getLiveWebinars", null);
__decorate([
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WebinarsController.prototype, "getWebinarById", null);
__decorate([
    (0, common_1.Put)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("instructorId")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, webinar_dto_1.UpdateWebinarDto]),
    __metadata("design:returntype", Promise)
], WebinarsController.prototype, "updateWebinar", null);
__decorate([
    (0, common_1.Delete)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("instructorId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WebinarsController.prototype, "deleteWebinar", null);
__decorate([
    (0, common_1.Post)("register"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [webinar_dto_1.RegisterForWebinarDto]),
    __metadata("design:returntype", Promise)
], WebinarsController.prototype, "registerForWebinar", null);
__decorate([
    (0, common_1.Get)("user/:userId/registrations"),
    __param(0, (0, common_1.Param)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WebinarsController.prototype, "getUserRegistrations", null);
__decorate([
    (0, common_1.Get)(":webinarId/registrations"),
    __param(0, (0, common_1.Param)("webinarId")),
    __param(1, (0, common_1.Query)("instructorId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WebinarsController.prototype, "getWebinarRegistrations", null);
__decorate([
    (0, common_1.Post)(":webinarId/attendance"),
    __param(0, (0, common_1.Param)("webinarId")),
    __param(1, (0, common_1.Query)("userId")),
    __param(2, (0, common_1.Body)("attended")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Boolean]),
    __metadata("design:returntype", Promise)
], WebinarsController.prototype, "markAttendance", null);
__decorate([
    (0, common_1.Post)("feedback"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [webinar_dto_1.SubmitWebinarFeedbackDto]),
    __metadata("design:returntype", Promise)
], WebinarsController.prototype, "submitFeedback", null);
__decorate([
    (0, common_1.Get)(":webinarId/feedback"),
    __param(0, (0, common_1.Param)("webinarId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WebinarsController.prototype, "getWebinarFeedback", null);
__decorate([
    (0, common_1.Post)("chat"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [webinar_dto_1.SendChatMessageDto]),
    __metadata("design:returntype", Promise)
], WebinarsController.prototype, "sendChatMessage", null);
__decorate([
    (0, common_1.Get)(":webinarId/chat"),
    __param(0, (0, common_1.Param)("webinarId")),
    __param(1, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], WebinarsController.prototype, "getChatMessages", null);
__decorate([
    (0, common_1.Post)("test-feedback"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WebinarsController.prototype, "testFeedback", null);
__decorate([
    (0, common_1.Get)(":webinarId/user/:userId/status"),
    __param(0, (0, common_1.Param)("webinarId")),
    __param(1, (0, common_1.Param)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WebinarsController.prototype, "getUserStatus", null);
__decorate([
    (0, common_1.Get)("debug/all-webinars"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WebinarsController.prototype, "debugAllWebinars", null);
__decorate([
    (0, common_1.Get)("debug/live-check"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WebinarsController.prototype, "debugLiveCheck", null);
exports.WebinarsController = WebinarsController = __decorate([
    (0, common_1.Controller)("api/webinars"),
    __metadata("design:paramtypes", [webinars_service_1.WebinarsService])
], WebinarsController);
//# sourceMappingURL=webinars.controller.js.map