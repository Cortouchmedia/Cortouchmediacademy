import { ConfigService } from "@nestjs/config";
import { SupabaseService } from "../../supabase.service";
import { PaystackService } from "./paystack.service";
import { InitializePaymentDto, VerifyPaymentDto, CreatePlanDto, CreateSubscriptionDto, CancelSubscriptionDto } from "./dto/payment.dto";
export declare class PaymentsService {
    private readonly supabaseService;
    private readonly paystackService;
    private readonly configService;
    private readonly logger;
    constructor(supabaseService: SupabaseService, paystackService: PaystackService, configService: ConfigService);
    getSupabaseClient(): import("@supabase/supabase-js/dist/index.cjs").SupabaseClient<any, "public", "public", any, any>;
    initializePayment(initDto: InitializePaymentDto): Promise<{
        success: boolean;
        message: string;
        authorization_url: any;
        reference: string;
        transaction_id: any;
    }>;
    verifyPayment(verifyDto: VerifyPaymentDto): Promise<{
        success: boolean;
        message: string;
        transaction: any;
    }>;
    private enrollUserInCourse;
    getUserTransactions(userId: string, page?: number, limit?: number): Promise<{
        transactions: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getCourseRevenue(courseId: string, instructorId: string): Promise<{
        course_title: any;
        total_revenue: number;
        total_sales: number;
        average_order_value: number;
        monthly_breakdown: {
            month: string;
            revenue: number;
            sales: number;
        }[];
        recent_transactions: {
            amount: any;
            status: any;
            created_at: any;
        }[];
    }>;
    private calculateMonthlyRevenue;
    getPlatformRevenue(): Promise<{
        total_revenue: number;
        total_sales: number;
        platform_revenue: number;
        instructor_revenue: number;
        platform_fee_percentage: number;
    }>;
    createPlan(createPlanDto: CreatePlanDto): Promise<{
        success: boolean;
        plan: any;
        paystack_plan: any;
    }>;
    createSubscription(subscriptionDto: CreateSubscriptionDto): Promise<{
        success: boolean;
        subscription: any;
        paystack_data: any;
    }>;
    getUserSubscription(userId: string, courseId: string): Promise<any>;
    cancelSubscription(cancelDto: CancelSubscriptionDto): Promise<{
        success: boolean;
        message: string;
        subscription: any;
    }>;
    getPaymentHistory(userId: string, page?: number, limit?: number): Promise<{
        transactions: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    refundTransaction(transactionId: string, amount?: number): Promise<{
        success: boolean;
        message: string;
        refund: any;
        transaction: any;
    }>;
}
