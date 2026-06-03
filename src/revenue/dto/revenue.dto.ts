// src/revenue/dto/revenue.dto.ts
export class PayoutSettingsDto {
  bank_name: string;
  account_number: string;
  account_name: string;
  bank_code?: string;
  minimum_payout_amount?: number;
  auto_payout_enabled?: boolean;
  tax_id?: string;
  tax_country?: string;
}

export class RequestPayoutDto {
  instructor_id: string;
  amount: number;
  payment_method?: string;
  notes?: string;
}

export class ProcessPayoutDto {
  payout_id: string;
  admin_id: string;
  reference?: string;
}

export class UpdatePayoutStatusDto {
  status: "pending" | "processing" | "completed" | "failed";
  notes?: string;
}

export class EarningsFilterDto {
  start_date?: Date;
  end_date?: Date;
  course_id?: string;
  status?: string;
  page?: number;
  limit?: number;
}
