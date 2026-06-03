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
var PaymentsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const payments_service_1 = require("./payments.service");
const payment_dto_1 = require("./dto/payment.dto");
const paystack_service_1 = require("./paystack.service");
let PaymentsController = PaymentsController_1 = class PaymentsController {
    constructor(paymentsService, paystackService) {
        this.paymentsService = paymentsService;
        this.paystackService = paystackService;
        this.logger = new common_1.Logger(PaymentsController_1.name);
    }
    async initializePayment(initDto) {
        return this.paymentsService.initializePayment(initDto);
    }
    async verifyPayment(reference) {
        if (!reference) {
            throw new common_1.BadRequestException("Reference is required");
        }
        return this.paymentsService.verifyPayment({ reference });
    }
    async handleWebhook(payload, signature) {
        this.logger.log(`Received webhook event: ${payload.event}`);
        const secret = process.env.PAYSTACK_SECRET_KEY;
        const crypto = require("crypto");
        const hash = crypto
            .createHmac("sha512", secret)
            .update(JSON.stringify(payload))
            .digest("hex");
        if (hash !== signature) {
            this.logger.error("Invalid webhook signature");
            throw new common_1.BadRequestException("Invalid webhook signature");
        }
        const event = payload.event;
        const data = payload.data;
        switch (event) {
            case "charge.success":
                await this.handleSuccessfulCharge(data);
                break;
            case "subscription.disable":
                await this.handleSubscriptionDisabled(data);
                break;
            case "invoice.payment_failed":
                await this.handleFailedPayment(data);
                break;
            case "subscription.create":
                await this.handleSubscriptionCreated(data);
                break;
            default:
                this.logger.log(`Unhandled event: ${event}`);
        }
        return { received: true };
    }
    async handleSuccessfulCharge(data) {
        const reference = data.reference;
        await this.paymentsService.verifyPayment({ reference });
    }
    async handleSubscriptionDisabled(data) {
        this.logger.log(`Subscription disabled: ${data.subscription_code}`);
    }
    async handleFailedPayment(data) {
        this.logger.error(`Failed payment: ${data.reference}`);
    }
    async handleSubscriptionCreated(data) {
        this.logger.log(`Subscription created: ${data.subscription_code}`);
    }
    async getUserTransactions(userId, page, limit) {
        return this.paymentsService.getUserTransactions(userId, page ? +page : 1, limit ? +limit : 20);
    }
    async getCourseRevenue(courseId, instructorId) {
        return this.paymentsService.getCourseRevenue(courseId, instructorId);
    }
    async getPlatformRevenue() {
        return this.paymentsService.getPlatformRevenue();
    }
    async createPlan(createPlanDto) {
        return this.paymentsService.createPlan(createPlanDto);
    }
    async createSubscription(subscriptionDto) {
        return this.paymentsService.createSubscription(subscriptionDto);
    }
    async getUserSubscription(userId, courseId) {
        return this.paymentsService.getUserSubscription(userId, courseId);
    }
    async cancelSubscription(cancelDto) {
        return this.paymentsService.cancelSubscription(cancelDto);
    }
    async getPaymentHistory(userId, page, limit) {
        return this.paymentsService.getPaymentHistory(userId, page ? +page : 1, limit ? +limit : 20);
    }
    async refundTransaction(transactionId, amount) {
        return this.paymentsService.refundTransaction(transactionId, amount);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)("initialize"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payment_dto_1.InitializePaymentDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "initializePayment", null);
__decorate([
    (0, common_1.Get)("verify"),
    __param(0, (0, common_1.Query)("reference")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "verifyPayment", null);
__decorate([
    (0, common_1.Post)("webhook"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)("x-paystack-signature")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Get)("user/:userId/transactions"),
    __param(0, (0, common_1.Param)("userId")),
    __param(1, (0, common_1.Query)("page")),
    __param(2, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getUserTransactions", null);
__decorate([
    (0, common_1.Get)("revenue/course/:courseId"),
    __param(0, (0, common_1.Param)("courseId")),
    __param(1, (0, common_1.Query)("instructorId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getCourseRevenue", null);
__decorate([
    (0, common_1.Get)("revenue/platform"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPlatformRevenue", null);
__decorate([
    (0, common_1.Post)("plans"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payment_dto_1.CreatePlanDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createPlan", null);
__decorate([
    (0, common_1.Post)("subscriptions"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payment_dto_1.CreateSubscriptionDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createSubscription", null);
__decorate([
    (0, common_1.Get)("subscriptions/user/:userId/course/:courseId"),
    __param(0, (0, common_1.Param)("userId")),
    __param(1, (0, common_1.Param)("courseId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getUserSubscription", null);
__decorate([
    (0, common_1.Post)("subscriptions/cancel"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payment_dto_1.CancelSubscriptionDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "cancelSubscription", null);
__decorate([
    (0, common_1.Get)("user/:userId/history"),
    __param(0, (0, common_1.Param)("userId")),
    __param(1, (0, common_1.Query)("page")),
    __param(2, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPaymentHistory", null);
__decorate([
    (0, common_1.Post)("refund/:transactionId"),
    __param(0, (0, common_1.Param)("transactionId")),
    __param(1, (0, common_1.Body)("amount")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "refundTransaction", null);
exports.PaymentsController = PaymentsController = PaymentsController_1 = __decorate([
    (0, common_1.Controller)("api/payments"),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService,
        paystack_service_1.PaystackService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map