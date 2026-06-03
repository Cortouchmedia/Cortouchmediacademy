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
exports.RevenueController = void 0;
const common_1 = require("@nestjs/common");
const revenue_service_1 = require("./revenue.service");
const revenue_dto_1 = require("./dto/revenue.dto");
let RevenueController = class RevenueController {
    constructor(revenueService) {
        this.revenueService = revenueService;
    }
    async getInstructorEarnings(instructorId, start_date, end_date, course_id, status, page, limit) {
        return this.revenueService.getInstructorEarnings(instructorId, {
            start_date: start_date ? new Date(start_date) : undefined,
            end_date: end_date ? new Date(end_date) : undefined,
            course_id,
            status,
            page: page ? +page : 1,
            limit: limit ? +limit : 20,
        });
    }
    async getEarningsSummary(instructorId) {
        return this.revenueService.getEarningsSummary(instructorId);
    }
    async getRevenueAnalytics(instructorId, days) {
        return this.revenueService.getRevenueAnalytics(instructorId, days ? +days : 30);
    }
    async getPayoutSettings(instructorId) {
        return this.revenueService.getPayoutSettings(instructorId);
    }
    async updatePayoutSettings(instructorId, settingsDto) {
        return this.revenueService.updatePayoutSettings(instructorId, settingsDto);
    }
    async requestPayout(requestDto) {
        return this.revenueService.requestPayout(requestDto);
    }
    async getPayouts(instructorId, page, limit) {
        return this.revenueService.getPayouts(instructorId, page ? +page : 1, limit ? +limit : 20);
    }
    async getPayoutById(instructorId, payoutId) {
        return this.revenueService.getPayoutById(payoutId, instructorId);
    }
    async getAllPayouts(status, page, limit) {
        return this.revenueService.getAllPayouts(status, page ? +page : 1, limit ? +limit : 20);
    }
    async processPayout(processDto) {
        return this.revenueService.processPayout(processDto);
    }
    async completePayout(payoutId, reference) {
        if (!reference) {
            throw new common_1.BadRequestException("Transaction reference is required");
        }
        return this.revenueService.completePayout(payoutId, reference);
    }
    async failPayout(payoutId, reason) {
        if (!reason) {
            throw new common_1.BadRequestException("Failure reason is required");
        }
        return this.revenueService.failPayout(payoutId, reason);
    }
    async getPlatformRevenueStats() {
        return this.revenueService.getPlatformRevenueStats();
    }
};
exports.RevenueController = RevenueController;
__decorate([
    (0, common_1.Get)("instructor/:instructorId/earnings"),
    __param(0, (0, common_1.Param)("instructorId")),
    __param(1, (0, common_1.Query)("start_date")),
    __param(2, (0, common_1.Query)("end_date")),
    __param(3, (0, common_1.Query)("course_id")),
    __param(4, (0, common_1.Query)("status")),
    __param(5, (0, common_1.Query)("page")),
    __param(6, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], RevenueController.prototype, "getInstructorEarnings", null);
__decorate([
    (0, common_1.Get)("instructor/:instructorId/summary"),
    __param(0, (0, common_1.Param)("instructorId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RevenueController.prototype, "getEarningsSummary", null);
__decorate([
    (0, common_1.Get)("instructor/:instructorId/analytics"),
    __param(0, (0, common_1.Param)("instructorId")),
    __param(1, (0, common_1.Query)("days")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], RevenueController.prototype, "getRevenueAnalytics", null);
__decorate([
    (0, common_1.Get)("instructor/:instructorId/payout-settings"),
    __param(0, (0, common_1.Param)("instructorId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RevenueController.prototype, "getPayoutSettings", null);
__decorate([
    (0, common_1.Put)("instructor/:instructorId/payout-settings"),
    __param(0, (0, common_1.Param)("instructorId")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, revenue_dto_1.PayoutSettingsDto]),
    __metadata("design:returntype", Promise)
], RevenueController.prototype, "updatePayoutSettings", null);
__decorate([
    (0, common_1.Post)("payouts/request"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [revenue_dto_1.RequestPayoutDto]),
    __metadata("design:returntype", Promise)
], RevenueController.prototype, "requestPayout", null);
__decorate([
    (0, common_1.Get)("instructor/:instructorId/payouts"),
    __param(0, (0, common_1.Param)("instructorId")),
    __param(1, (0, common_1.Query)("page")),
    __param(2, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], RevenueController.prototype, "getPayouts", null);
__decorate([
    (0, common_1.Get)("instructor/:instructorId/payouts/:payoutId"),
    __param(0, (0, common_1.Param)("instructorId")),
    __param(1, (0, common_1.Param)("payoutId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RevenueController.prototype, "getPayoutById", null);
__decorate([
    (0, common_1.Get)("admin/payouts"),
    __param(0, (0, common_1.Query)("status")),
    __param(1, (0, common_1.Query)("page")),
    __param(2, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], RevenueController.prototype, "getAllPayouts", null);
__decorate([
    (0, common_1.Post)("admin/payouts/process"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [revenue_dto_1.ProcessPayoutDto]),
    __metadata("design:returntype", Promise)
], RevenueController.prototype, "processPayout", null);
__decorate([
    (0, common_1.Post)("admin/payouts/:payoutId/complete"),
    __param(0, (0, common_1.Param)("payoutId")),
    __param(1, (0, common_1.Body)("reference")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RevenueController.prototype, "completePayout", null);
__decorate([
    (0, common_1.Post)("admin/payouts/:payoutId/fail"),
    __param(0, (0, common_1.Param)("payoutId")),
    __param(1, (0, common_1.Body)("reason")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RevenueController.prototype, "failPayout", null);
__decorate([
    (0, common_1.Get)("admin/platform-stats"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RevenueController.prototype, "getPlatformRevenueStats", null);
exports.RevenueController = RevenueController = __decorate([
    (0, common_1.Controller)("api/revenue"),
    __metadata("design:paramtypes", [revenue_service_1.RevenueService])
], RevenueController);
//# sourceMappingURL=revenue.controller.js.map