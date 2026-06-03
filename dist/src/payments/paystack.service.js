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
var PaystackService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaystackService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let PaystackService = PaystackService_1 = class PaystackService {
    constructor(configService, httpService) {
        this.configService = configService;
        this.httpService = httpService;
        this.logger = new common_1.Logger(PaystackService_1.name);
        this.baseUrl = "https://api.paystack.co";
        this.secretKey = this.configService.get("PAYSTACK_SECRET_KEY");
        if (!this.secretKey) {
            this.logger.warn("PAYSTACK_SECRET_KEY not set in environment variables");
        }
    }
    async request(endpoint, method, data) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            Authorization: `Bearer ${this.secretKey}`,
            "Content-Type": "application/json",
        };
        try {
            let response;
            if (method === "GET") {
                response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers }));
            }
            else {
                response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, data, { headers }));
            }
            if (!response.data.status) {
                this.logger.error(`Paystack API error: ${response.data.message}`);
                throw new common_1.BadRequestException(response.data.message);
            }
            return response.data;
        }
        catch (error) {
            this.logger.error(`Paystack request failed: ${error.message}`);
            throw new common_1.BadRequestException(`Payment gateway error: ${error.message}`);
        }
    }
    async initializeTransaction(data) {
        return this.request("/transaction/initialize", "POST", data);
    }
    async verifyTransaction(reference) {
        return this.request(`/transaction/verify/${reference}`, "GET");
    }
    async createPlan(data) {
        return this.request("/plan", "POST", data);
    }
    async createSubscription(data) {
        return this.request("/subscription", "POST", data);
    }
    async disableSubscription(data) {
        return this.request("/subscription/disable", "POST", data);
    }
    async enableSubscription(data) {
        return this.request("/subscription/enable", "POST", data);
    }
    async refundTransaction(data) {
        return this.request("/refund", "POST", data);
    }
    async listTransactions(params) {
        let endpoint = "/transaction";
        const queryParams = [];
        if (params?.perPage)
            queryParams.push(`perPage=${params.perPage}`);
        if (params?.page)
            queryParams.push(`page=${params.page}`);
        if (params?.from)
            queryParams.push(`from=${params.from}`);
        if (params?.to)
            queryParams.push(`to=${params.to}`);
        if (queryParams.length > 0) {
            endpoint += `?${queryParams.join("&")}`;
        }
        return this.request(endpoint, "GET");
    }
    async getPlan(planCode) {
        return this.request(`/plan/${planCode}`, "GET");
    }
    async getSubscription(subscriptionCode) {
        return this.request(`/subscription/${subscriptionCode}`, "GET");
    }
};
exports.PaystackService = PaystackService;
exports.PaystackService = PaystackService = PaystackService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        axios_1.HttpService])
], PaystackService);
//# sourceMappingURL=paystack.service.js.map