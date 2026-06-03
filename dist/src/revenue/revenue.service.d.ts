import { SupabaseService } from "../../supabase.service";
import { PayoutSettingsDto, RequestPayoutDto, ProcessPayoutDto, EarningsFilterDto } from "./dto/revenue.dto";
export declare class RevenueService {
    private readonly supabaseService;
    private readonly logger;
    constructor(supabaseService: SupabaseService);
    getSupabaseClient(): import("@supabase/supabase-js/dist/index.cjs").SupabaseClient<any, "public", "public", any, any>;
    getInstructorEarnings(instructorId: string, filterDto?: EarningsFilterDto): Promise<{
        earnings: any[];
        summary: {
            total_earnings: number;
            total_platform_fees: number;
            available_balance: number;
            pending_balance: number;
            paid_balance: number;
            this_month_earnings: number;
            top_courses: any[];
            total_transactions: number;
        };
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getEarningsSummary(instructorId: string): Promise<{
        total_earnings: number;
        total_platform_fees: number;
        available_balance: number;
        pending_balance: number;
        paid_balance: number;
        this_month_earnings: number;
        top_courses: any[];
        total_transactions: number;
    }>;
    getRevenueAnalytics(instructorId: string, days?: number): Promise<{
        chart_data: {
            date: any;
            sales: any;
            revenue: any;
            earnings: any;
        }[];
        total_days: number;
        summary: {
            total_sales: number;
            total_revenue: number;
            total_earnings: number;
        };
    }>;
    getPayoutSettings(instructorId: string): Promise<any>;
    updatePayoutSettings(instructorId: string, settingsDto: PayoutSettingsDto): Promise<{
        success: boolean;
        message: string;
        settings: any;
    }>;
    requestPayout(requestDto: RequestPayoutDto): Promise<{
        success: boolean;
        message: string;
        payout: any;
    }>;
    private markEarningsForPayout;
    getPayouts(instructorId: string, page?: number, limit?: number): Promise<{
        payouts: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getPayoutById(payoutId: string, instructorId: string): Promise<{
        payout: any;
        earnings: any[];
    }>;
    getAllPayouts(status?: string, page?: number, limit?: number): Promise<{
        payouts: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    processPayout(processDto: ProcessPayoutDto): Promise<{
        success: boolean;
        message: string;
        payout: any;
    }>;
    completePayout(payoutId: string, reference: string): Promise<{
        success: boolean;
        message: string;
        payout: any;
    }>;
    failPayout(payoutId: string, reason: string): Promise<{
        success: boolean;
        message: string;
        payout: any;
    }>;
    getPlatformRevenueStats(): Promise<{
        total_platform_fees: number;
        total_payouts_processed: number;
        pending_payouts: number;
        active_instructors: number;
    }>;
}
