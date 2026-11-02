// src/payments/paystack.service.ts
import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

@Injectable()
export class PaystackService {
  private readonly logger = new Logger(PaystackService.name);
  private readonly baseUrl = "https://api.paystack.co";
  private readonly secretKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.secretKey = this.configService.get("PAYSTACK_SECRET_KEY");
    if (!this.secretKey) {
      this.logger.warn("PAYSTACK_SECRET_KEY not set in environment variables");
    }
  }

  private async request(
    endpoint: string,
    method: "POST" | "GET" | "PUT" | "DELETE",
    data?: any,
  ) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      Authorization: `Bearer ${this.secretKey}`,
      "Content-Type": "application/json",
    };

    try {
      let response;
      if (method === "GET") {
        response = await firstValueFrom(this.httpService.get(url, { headers }));
      } else {
        response = await firstValueFrom(
          this.httpService.post(url, data, { headers }),
        );
      }

      if (!response.data.status) {
        this.logger.error(`Paystack API error: ${response.data.message}`);
        throw new BadRequestException(response.data.message);
      }

      return response.data;
    } catch (error: any) {
      this.logger.error(`Paystack request failed: ${error.message}`);
      throw new BadRequestException(`Payment gateway error: ${error.message}`);
    }
  }

  async initializeTransaction(data: {
    email: string;
    amount: number;
    reference: string;
    callback_url?: string;
    metadata?: any;
  }) {
    return this.request("/transaction/initialize", "POST", data);
  }

  async verifyTransaction(reference: string) {
    return this.request(`/transaction/verify/${reference}`, "GET");
  }

  async createPlan(data: {
    name: string;
    amount: number;
    interval: string;
    description?: string;
    invoice_limit?: number;
  }) {
    return this.request("/plan", "POST", data);
  }

  async createSubscription(data: {
    customer: string;
    plan: string;
    authorization?: string;
    start_date?: string;
  }) {
    return this.request("/subscription", "POST", data);
  }

  async disableSubscription(data: { code: string; token: string }) {
    return this.request("/subscription/disable", "POST", data);
  }

  async enableSubscription(data: { code: string; token: string }) {
    return this.request("/subscription/enable", "POST", data);
  }

  async refundTransaction(data: {
    transaction: string;
    amount?: number;
    currency?: string;
  }) {
    return this.request("/refund", "POST", data);
  }

  async listTransactions(params?: {
    perPage?: number;
    page?: number;
    from?: string;
    to?: string;
  }) {
    let endpoint = "/transaction";
    const queryParams = [];
    if (params?.perPage) queryParams.push(`perPage=${params.perPage}`);
    if (params?.page) queryParams.push(`page=${params.page}`);
    if (params?.from) queryParams.push(`from=${params.from}`);
    if (params?.to) queryParams.push(`to=${params.to}`);

    if (queryParams.length > 0) {
      endpoint += `?${queryParams.join("&")}`;
    }

    return this.request(endpoint, "GET");
  }

  async getPlan(planCode: string) {
    return this.request(`/plan/${planCode}`, "GET");
  }

  async getSubscription(subscriptionCode: string) {
    return this.request(`/subscription/${subscriptionCode}`, "GET");
  }
}
