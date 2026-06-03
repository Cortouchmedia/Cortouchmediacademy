export declare class InitializePaymentDto {
    course_id: string;
    user_id: string;
    email: string;
    amount?: number;
    callback_url?: string;
}
export declare class VerifyPaymentDto {
    reference: string;
}
export declare class WebhookPayloadDto {
    event: string;
    data: any;
}
export declare class CreatePlanDto {
    name: string;
    amount: number;
    interval: "hourly" | "daily" | "weekly" | "monthly" | "quarterly" | "biannually" | "annually";
    description?: string;
    invoice_limit?: number;
}
export declare class CreateSubscriptionDto {
    plan_code: string;
    email: string;
    user_id: string;
    course_id: string;
}
export declare class CancelSubscriptionDto {
    subscription_code: string;
    user_id: string;
}
