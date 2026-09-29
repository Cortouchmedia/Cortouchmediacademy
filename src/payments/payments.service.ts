// src/payments/payments.service.ts
import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SupabaseService } from "../supabase/supabase.service";
import { PaystackService } from "./paystack.service";
import {
  InitializePaymentDto,
  VerifyPaymentDto,
  CreatePlanDto,
  CreateSubscriptionDto,
  CancelSubscriptionDto,
} from "./dto/payment.dto";
import { randomBytes } from "crypto";

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly paystackService: PaystackService,
    private readonly configService: ConfigService,
  ) {}

  getSupabaseClient() {
    return this.supabaseService.getAdminClient();
  }

  // ==================== COURSE PURCHASE ====================

  async initializePayment(initDto: InitializePaymentDto) {
    const supabase = this.getSupabaseClient();

    // Get course details
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, title, price, instructor_id")
      .eq("id", initDto.course_id)
      .single();

    if (courseError || !course) {
      throw new NotFoundException("Course not found");
    }

    // Check if user already enrolled
    const { data: existingEnrollment } = await supabase
      .from("course_enrollments")
      .select("id")
      .eq("user_id", initDto.user_id)
      .eq("course_id", initDto.course_id)
      .maybeSingle();

    if (existingEnrollment) {
      throw new BadRequestException("User already enrolled in this course");
    }

    // Generate unique reference
    const reference = `PAY-${Date.now()}-${randomBytes(6).toString("hex")}`;
    const amount = initDto.amount || course.price;
    const callbackUrl =
      initDto.callback_url ||
      `${this.configService.get("APP_URL")}/payment/verify`;

    // Create payment transaction record
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
      throw new BadRequestException(
        `Failed to create transaction: ${txError.message}`,
      );
    }

    // Initialize Paystack transaction
    const paystackResponse = await this.paystackService.initializeTransaction({
      email: initDto.email,
      amount: amount * 100, // Paystack uses kobo/cents
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

  // src/payments/payments.service.ts - Fix verifyPayment method
  async verifyPayment(verifyDto: VerifyPaymentDto) {
    const supabase = this.getSupabaseClient();

    // Verify with Paystack
    const verification = await this.paystackService.verifyTransaction(
      verifyDto.reference,
    );

    // Fix: Check status correctly - removed the !
    if (verification.data.status !== "success") {
      throw new BadRequestException("Payment verification failed");
    }

    // Get transaction
    const { data: transaction, error: txError } = await supabase
      .from("payment_transactions")
      .select("*")
      .eq("reference", verifyDto.reference)
      .single();

    if (txError || !transaction) {
      throw new NotFoundException("Transaction not found");
    }

    // Update transaction status
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
      throw new BadRequestException(
        `Failed to update transaction: ${updateError.message}`,
      );
    }

    // Enroll user in course
    await this.enrollUserInCourse(
      transaction.user_id,
      transaction.course_id,
      transaction.id,
    );

    return {
      success: true,
      message: "Payment verified and course enrollment completed",
      transaction: updatedTx,
    };
  }

  private async enrollUserInCourse(
    userId: string,
    courseId: string,
    paymentId: string,
  ) {
    const supabase = this.getSupabaseClient();

    // Check if already enrolled
    const { data: existing } = await supabase
      .from("course_enrollments")
      .select("id")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .maybeSingle();

    if (existing) {
      return;
    }

    // Create enrollment
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
      throw new BadRequestException(`Failed to enroll user: ${error.message}`);
    }

    return enrollment;
  }

  // ==================== TRANSACTIONS ====================

  async getUserTransactions(userId: string, page = 1, limit = 20) {
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
      throw new BadRequestException(
        `Failed to fetch transactions: ${error.message}`,
      );
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

  async getCourseRevenue(courseId: string, instructorId: string) {
    const supabase = this.getSupabaseClient();

    // Verify instructor owns this course
    const { data: course } = await supabase
      .from("courses")
      .select("instructor_id, title")
      .eq("id", courseId)
      .single();

    if (!course || course.instructor_id !== instructorId) {
      throw new BadRequestException(
        "You can only view revenue for your own courses",
      );
    }

    const { data: transactions, error } = await supabase
      .from("payment_transactions")
      .select("amount, status, created_at")
      .eq("course_id", courseId)
      .eq("status", "success");

    if (error) {
      throw new BadRequestException(
        `Failed to fetch revenue: ${error.message}`,
      );
    }

    const totalRevenue =
      transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
    const totalSales = transactions?.length || 0;
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Monthly breakdown
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

  private calculateMonthlyRevenue(transactions: any[]) {
    const monthly: Record<string, { revenue: number; sales: number }> = {};

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
      throw new BadRequestException(
        `Failed to fetch revenue: ${error.message}`,
      );
    }

    const totalRevenue =
      transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
    const totalSales = transactions?.length || 0;

    // Platform fee (e.g., 10%)
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

  // ==================== SUBSCRIPTIONS ====================

  async createPlan(createPlanDto: CreatePlanDto) {
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
      throw new BadRequestException(`Failed to save plan: ${error.message}`);
    }

    return {
      success: true,
      plan: data,
      paystack_plan: paystackPlan.data,
    };
  }

  async createSubscription(subscriptionDto: CreateSubscriptionDto) {
    const supabase = this.getSupabaseClient();

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from("payment_plans")
      .select("*")
      .eq("plan_code", subscriptionDto.plan_code)
      .single();

    if (planError || !plan) {
      throw new NotFoundException("Plan not found");
    }

    // Create subscription with Paystack
    const paystackSubscription = await this.paystackService.createSubscription({
      customer: subscriptionDto.email,
      plan: subscriptionDto.plan_code,
    });

    // Save subscription to database
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
        current_period_end: new Date(
          paystackSubscription.data.next_payment_date,
        ),
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Failed to save subscription: ${error.message}`,
      );
    }

    // Enroll user immediately for subscription-based course
    await this.enrollUserInCourse(
      subscriptionDto.user_id,
      subscriptionDto.course_id,
      null,
    );

    return {
      success: true,
      subscription,
      paystack_data: paystackSubscription.data,
    };
  }

  async getUserSubscription(userId: string, courseId: string) {
    const supabase = this.getSupabaseClient();

    const { data, error } = await supabase
      .from("subscriptions")
      .select("*, plan:plan_id(*)")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .eq("status", "active")
      .maybeSingle();

    if (error) {
      throw new BadRequestException(
        `Failed to fetch subscription: ${error.message}`,
      );
    }

    return data;
  }

  async cancelSubscription(cancelDto: CancelSubscriptionDto) {
    const supabase = this.getSupabaseClient();

    // Get subscription
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("subscription_code", cancelDto.subscription_code)
      .eq("user_id", cancelDto.user_id)
      .single();

    if (subError || !subscription) {
      throw new NotFoundException("Subscription not found");
    }

    // Cancel with Paystack
    await this.paystackService.disableSubscription({
      code: cancelDto.subscription_code,
      token: subscription.subscription_code,
    });

    // Update subscription status
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
      throw new BadRequestException(
        `Failed to cancel subscription: ${error.message}`,
      );
    }

    return {
      success: true,
      message:
        "Subscription cancelled successfully. Access will continue until period end.",
      subscription: data,
    };
  }

  async getPaymentHistory(userId: string, page = 1, limit = 20) {
    return this.getUserTransactions(userId, page, limit);
  }

  // ==================== REFUNDS ====================

  async refundTransaction(transactionId: string, amount?: number) {
    const supabase = this.getSupabaseClient();

    const { data: transaction, error: txError } = await supabase
      .from("payment_transactions")
      .select("*")
      .eq("id", transactionId)
      .single();

    if (txError || !transaction) {
      throw new NotFoundException("Transaction not found");
    }

    if (transaction.status !== "success") {
      throw new BadRequestException(
        "Only successful transactions can be refunded",
      );
    }

    // Process refund with Paystack
    const refund = await this.paystackService.refundTransaction({
      transaction: transaction.paystack_transaction_id,
      amount: amount ? amount * 100 : undefined,
    });

    // Update transaction status
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
      throw new BadRequestException(
        `Failed to update transaction: ${error.message}`,
      );
    }

    // Remove course enrollment
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
}
