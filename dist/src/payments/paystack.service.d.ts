import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
export declare class PaystackService {
    private readonly configService;
    private readonly httpService;
    private readonly logger;
    private readonly baseUrl;
    private readonly secretKey;
    constructor(configService: ConfigService, httpService: HttpService);
    private request;
    initializeTransaction(data: {
        email: string;
        amount: number;
        reference: string;
        callback_url?: string;
        metadata?: any;
    }): Promise<any>;
    verifyTransaction(reference: string): Promise<any>;
    createPlan(data: {
        name: string;
        amount: number;
        interval: string;
        description?: string;
        invoice_limit?: number;
    }): Promise<any>;
    createSubscription(data: {
        customer: string;
        plan: string;
        authorization?: string;
        start_date?: string;
    }): Promise<any>;
    disableSubscription(data: {
        code: string;
        token: string;
    }): Promise<any>;
    enableSubscription(data: {
        code: string;
        token: string;
    }): Promise<any>;
    refundTransaction(data: {
        transaction: string;
        amount?: number;
        currency?: string;
    }): Promise<any>;
    listTransactions(params?: {
        perPage?: number;
        page?: number;
        from?: string;
        to?: string;
    }): Promise<any>;
    getPlan(planCode: string): Promise<any>;
    getSubscription(subscriptionCode: string): Promise<any>;
}
