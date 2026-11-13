import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsBoolean,
  IsIn,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PayoutSettingsDto {
  @IsString()
  bank_name: string;

  @IsString()
  account_number: string;

  @IsString()
  account_name: string;

  @IsOptional()
  @IsString()
  bank_code?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minimum_payout_amount?: number;

  @IsOptional()
  @IsBoolean()
  auto_payout_enabled?: boolean;

  @IsOptional()
  @IsString()
  tax_id?: string;

  @IsOptional()
  @IsString()
  tax_country?: string;
}

export class RequestPayoutDto {
  @IsString()
  instructor_id: string;

  @Type(() => Number) // 👈 THIS IS THE MAGIC FIX: Converts string "90000" to number 90000
  @IsNumber()
  @Min(5000) // 👈 Enforce the minimum here at the DTO level
  amount: number;

  @IsOptional()
  @IsString()
  payment_method?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ProcessPayoutDto {
  @IsString()
  payout_id: string;

  @IsString()
  admin_id: string;

  @IsOptional()
  @IsString()
  reference?: string;
}

export class UpdatePayoutStatusDto {
  @IsIn(["pending", "processing", "completed", "failed"])
  status: "pending" | "processing" | "completed" | "failed";

  @IsOptional()
  @IsString()
  notes?: string;
}

export class EarningsFilterDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  start_date?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  end_date?: Date;

  @IsOptional()
  @IsString()
  course_id?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}