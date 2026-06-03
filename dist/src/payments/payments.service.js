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
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_service_1 = require("../../supabase.service");
const paystack_service_1 = require("./paystack.service");
const crypto_1 = require("crypto");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    constructor(supabaseService, paystackService, configService) {
        this.supabaseService = supabaseService;
        this.paystackService = paystackService;
        this.configService = configService;
        this.logger = new common_1.Logger(PaymentsService_1.name);
    }
    getSupabaseClient() {
        return this.supabaseService.getClient();
    }
    async initializePayment(initDto) {
        const supabase = this.getSupabaseClient();
        const { data: course, error: courseError } = await supabase
            .from("courses")
            .select("id, title, price, instructor_id")
            .eq("id", initDto.course_id)
            .single();
        if (courseError || !course) {
            throw new common_1.NotFoundException("Course not found");
        }
        const { data: existingEnrollment } = await supabase
            .from("course_enrollments")
            .select("id")
            .eq("user_id", initDto.user_id)
            .eq("course_id", initDto.course_id)
            .maybeSingle();
        if (existingEnrollment) {
            throw new common_1.BadRequestException("User already enrolled in this course");
        }
        const reference = `PAY-${Date.now()}-${(0, crypto_1.randomBytes)(6).toString("hex")}`;
        const amount = initDto.amount || course.price;
        const callbackUrl = initDto.callback_url ||
            `${this.configService.get("APP_URL")}/payment/verify`;
        const { data: transaction, error: txError } = await supabase
            .from("payment_transactions")
            .insert({
            user_id: initDto.user_id,
            course_id: initDto.course_id,
            amount: amount,
            reference: reference,
            status: "pending",
            metadata: {
                course_title: course.title,
                callback_url: callbackUrl,
            },
        })
            .select()
            .single();
        if (txError) {
            throw new common_1.BadRequestException(`Failed to create transaction: ${txError.message}`);
        }
        const paystackResponse = await this.paystackService.initializeTransaction({
            email: initDto.email,
            amount: amount * 100,
            reference: reference,
            callback_url: callbackUrl,
            metadata: {
                user_id: initDto.user_id,
                course_id: initDto.course_id,
                transaction_id: transaction.id,
            },
        });
        return {
            success: true,
            message: "Payment initialized",
            authorization_url: paystackResponse.data.authorization_url,
            reference: reference,
            transaction_id: transaction.id,
        };
    }
    async verifyPayment(verifyDto) {
        const supabase = this.getSupabaseClient();
        const verification = await this.paystackService.verifyTransaction(verifyDto.reference);
        if (verification.data.status !== "success") {
            throw new common_1.BadRequestException("Payment verification failed");
        }
        const { data: transaction, error: txError } = await supabase
            .from("payment_transactions")
            .select("*")
            .eq("reference", verifyDto.reference)
            .single();
        if (txError || !transaction) {
            throw new common_1.NotFoundException("Transaction not found");
        }
        const { data: updatedTx, error: updateError } = await supabase
            .from("payment_transactions")
            .update({
            status: "success",
            paystack_transaction_id: verification.data.id,
            paid_at: new Date(),
            updated_at: new Date(),
        })
            .eq("id", transaction.id)
            .select()
            .single();
        if (updateError) {
            throw new common_1.BadRequestException(`Failed to update transaction: ${updateError.message}`);
        }
        await this.enrollUserInCourse(transaction.user_id, transaction.course_id, transaction.id);
        return {
            success: true,
            message: "Payment verified and course enrollment completed",
            transaction: updatedTx,
        };
    }
    async enrollUserInCourse(userId, courseId, paymentId) {
        const supabase = this.getSupabaseClient();
        const { data: existing } = await supabase
            .from("course_enrollments")
            .select("id")
            .eq("user_id", userId)
            .eq("course_id", courseId)
            .maybeSingle();
        if (existing) {
            return;
        }
        const { data: enrollment, error } = await supabase
            .from("course_enrollments")
            .insert({
            user_id: userId,
            course_id: courseId,
            payment_id: paymentId,
            payment_status: "completed",
            enrollment_date: new Date(),
            progress_percentage: 0,
        })
            .select()
            .single();
        if (error) {
            this.logger.error(`Failed to enroll user: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to enroll user: ${error.message}`);
        }
        return enrollment;
    }
    async getUserTransactions(userId, page = 1, limit = 20) {
        const supabase = this.getSupabaseClient();
        const start = (page - 1) * limit;
        const end = start + limit - 1;
        const { data, error, count } = await supabase
            .from("payment_transactions")
            .select("*, course:course_id(title, image_url)", { count: "exact" })
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .range(start, end);
        if (error) {
            throw new common_1.BadRequestException(`Failed to fetch transactions: ${error.message}`);
        }
        return {
            transactions: data || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            },
        };
    }
    async getCourseRevenue(courseId, instructorId) {
        const supabase = this.getSupabaseClient();
        const { data: course } = await supabase
            .from("courses")
            .select("instructor_id, title")
            .eq("id", courseId)
            .single();
        if (!course || course.instructor_id !== instructorId) {
            throw new common_1.BadRequestException("You can only view revenue for your own courses");
        }
        const { data: transactions, error } = await supabase
            .from("payment_transactions")
            .select("amount, status, created_at")
            .eq("course_id", courseId)
            .eq("status", "success");
        if (error) {
            throw new common_1.BadRequestException(`Failed to fetch revenue: ${error.message}`);
        }
        const totalRevenue = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
        const totalSales = transactions?.length || 0;
        const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
        const monthlyBreakdown = this.calculateMonthlyRevenue(transactions || []);
        return {
            course_title: course.title,
            total_revenue: totalRevenue,
            total_sales: totalSales,
            average_order_value: averageOrderValue,
            monthly_breakdown: monthlyBreakdown,
            recent_transactions: transactions?.slice(0, 10),
        };
    }
    calculateMonthlyRevenue(transactions) {
        const monthly = {};
        transactions.forEach((t) => {
            const month = new Date(t.created_at).toLocaleString("default", {
                month: "long",
                year: "numeric",
            });
            if (!monthly[month]) {
                monthly[month] = { revenue: 0, sales: 0 };
            }
            monthly[month].revenue += t.amount || 0;
            monthly[month].sales += 1;
        });
        return Object.entries(monthly).map(([month, data]) => ({
            month,
            revenue: data.revenue,
            sales: data.sales,
        }));
    }
    async getPlatformRevenue() {
        const supabase = this.getSupabaseClient();
        const { data: transactions, error } = await supabase
            .from("payment_transactions")
            .select("amount, status, created_at")
            .eq("status", "success");
        if (error) {
            throw new common_1.BadRequestException(`Failed to fetch revenue: ${error.message}`);
        }
        const totalRevenue = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
        const totalSales = transactions?.length || 0;
        const platformFeePercentage = 10;
        const platformRevenue = totalRevenue * (platformFeePercentage / 100);
        const instructorRevenue = totalRevenue - platformRevenue;
        return {
            total_revenue: totalRevenue,
            total_sales: totalSales,
            platform_revenue: platformRevenue,
            instructor_revenue: instructorRevenue,
            platform_fee_percentage: platformFeePercentage,
        };
    }
    async createPlan(createPlanDto) {
        const paystackPlan = await this.paystackService.createPlan({
            name: createPlanDto.name,
            amount: createPlanDto.amount * 100,
            interval: createPlanDto.interval,
            description: createPlanDto.description,
            invoice_limit: createPlanDto.invoice_limit,
        });
        const supabase = this.getSupabaseClient();
        const { data, error } = await supabase
            .from("payment_plans")
            .insert({
            plan_code: paystackPlan.data.plan_code,
            name: createPlanDto.name,
            amount: createPlanDto.amount,
            interval: createPlanDto.interval,
            description: createPlanDto.description,
            is_active: true,
        })
            .select()
            .single();
        if (error) {
            throw new common_1.BadRequestException(`Failed to save plan: ${error.message}`);
        }
        return {
            success: true,
            plan: data,
            paystack_plan: paystackPlan.data,
        };
    }
    async createSubscription(subscriptionDto) {
        const supabase = this.getSupabaseClient();
        const { data: plan, error: planError } = await supabase
            .from("payment_plans")
            .select("*")
            .eq("plan_code", subscriptionDto.plan_code)
            .single();
        if (planError || !plan) {
            throw new common_1.NotFoundException("Plan not found");
        }
        const paystackSubscription = await this.paystackService.createSubscription({
            customer: subscriptionDto.email,
            plan: subscriptionDto.plan_code,
        });
        const { data: subscription, error } = await supabase
            .from("subscriptions")
            .insert({
            user_id: subscriptionDto.user_id,
            course_id: subscriptionDto.course_id,
            plan_id: plan.id,
            subscription_code: paystackSubscription.data.subscription_code,
            paystack_subscription_id: paystackSubscription.data.id,
            status: "active",
            current_period_start: new Date(),
            current_period_end: new Date(paystackSubscription.data.next_payment_date),
        })
            .select()
            .single();
        if (error) {
            throw new common_1.BadRequestException(`Failed to save subscription: ${error.message}`);
        }
        await this.enrollUserInCourse(subscriptionDto.user_id, subscriptionDto.course_id, null);
        return {
            success: true,
            subscription,
            paystack_data: paystackSubscription.data,
        };
    }
    async getUserSubscription(userId, courseId) {
        const supabase = this.getSupabaseClient();
        const { data, error } = await supabase
            .from("subscriptions")
            .select("*, plan:plan_id(*)")
            .eq("user_id", userId)
            .eq("course_id", courseId)
            .eq("status", "active")
            .maybeSingle();
        if (error) {
            throw new common_1.BadRequestException(`Failed to fetch subscription: ${error.message}`);
        }
        return data;
    }
    async cancelSubscription(cancelDto) {
        const supabase = this.getSupabaseClient();
        const { data: subscription, error: subError } = await supabase
            .from("subscriptions")
            .select("*")
            .eq("subscription_code", cancelDto.subscription_code)
            .eq("user_id", cancelDto.user_id)
            .single();
        if (subError || !subscription) {
            throw new common_1.NotFoundException("Subscription not found");
        }
        await this.paystackService.disableSubscription({
            code: cancelDto.subscription_code,
            token: subscription.subscription_code,
        });
        const { data, error } = await supabase
            .from("subscriptions")
            .update({
            status: "cancelled",
            cancelled_at: new Date(),
            updated_at: new Date(),
        })
            .eq("id", subscription.id)
            .select()
            .single();
        if (error) {
            throw new common_1.BadRequestException(`Failed to cancel subscription: ${error.message}`);
        }
        return {
            success: true,
            message: "Subscription cancelled successfully. Access will continue until period end.",
            subscription: data,
        };
    }
    async getPaymentHistory(userId, page = 1, limit = 20) {
        return this.getUserTransactions(userId, page, limit);
    }
    async refundTransaction(transactionId, amount) {
        const supabase = this.getSupabaseClient();
        const { data: transaction, error: txError } = await supabase
            .from("payment_transactions")
            .select("*")
            .eq("id", transactionId)
            .single();
        if (txError || !transaction) {
            throw new common_1.NotFoundException("Transaction not found");
        }
        if (transaction.status !== "success") {
            throw new common_1.BadRequestException("Only successful transactions can be refunded");
        }
        const refund = await this.paystackService.refundTransaction({
            transaction: transaction.paystack_transaction_id,
            amount: amount ? amount * 100 : undefined,
        });
        const { data, error } = await supabase
            .from("payment_transactions")
            .update({
            status: "refunded",
            updated_at: new Date(),
        })
            .eq("id", transactionId)
            .select()
            .single();
        if (error) {
            throw new common_1.BadRequestException(`Failed to update transaction: ${error.message}`);
        }
        await supabase
            .from("course_enrollments")
            .delete()
            .eq("user_id", transaction.user_id)
            .eq("course_id", transaction.course_id);
        return {
            success: true,
            message: "Transaction refunded successfully",
            refund: refund.data,
            transaction: data,
        };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService,
        paystack_service_1.PaystackService,
        config_1.ConfigService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map