// src/payments/dto/payment.dto.ts
export class InitializePaymentDto {
  course_id: string;
  user_id: string;
  email: string;
  amount?: number;
  callback_url?: string;
}

export class VerifyPaymentDto {
  reference: string;
}

export class WebhookPayloadDto {
  event: string;
  data: any;
}

export class CreatePlanDto {
  name: string;
  amount: number;
  interval:
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "quarterly"
    | "biannually"
    | "annually";
  description?: string;
  invoice_limit?: number;
}

export class CreateSubscriptionDto {
  plan_code: string;
  email: string;
  user_id: string;
  course_id: string;
}

export class CancelSubscriptionDto {
  subscription_code: string;
  user_id: string;
}
