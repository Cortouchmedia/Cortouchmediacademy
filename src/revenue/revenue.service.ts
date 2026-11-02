// src/revenue/revenue.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import {
  PayoutSettingsDto,
  RequestPayoutDto,
  ProcessPayoutDto,
  EarningsFilterDto,
} from "./dto/revenue.dto";
import { randomBytes } from "crypto";

@Injectable()
export class RevenueService {
  private readonly logger = new Logger(RevenueService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  getSupabaseClient() {
    return this.supabaseService.getAdminClient();
  }

  // ==================== EARNINGS MANAGEMENT ====================

  async getInstructorEarnings(
    instructorId: string,
    filterDto?: EarningsFilterDto,
  ) {
    const supabase = this.getSupabaseClient();

    let query = supabase
      .from("instructor_earnings")
      .select(
        `
        *,
        course:course_id(id, title, image_url),
        student:student_id(id, full_name, email),
        transaction:transaction_id(*)
      `,
      )
      .eq("instructor_id", instructorId);

    if (filterDto?.start_date) {
      query = query.gte("created_at", filterDto.start_date.toISOString());
    }
    if (filterDto?.end_date) {
      query = query.lte("created_at", filterDto.end_date.toISOString());
    }
    if (filterDto?.course_id) {
      query = query.eq("course_id", filterDto.course_id);
    }
    if (filterDto?.status) {
      query = query.eq("status", filterDto.status);
    }

    query = query.order("created_at", { ascending: false });

    const page = filterDto?.page || 1;
    const limit = filterDto?.limit || 20;
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    query = query.range(start, end);

    const { data, error, count } = await query;

    if (error) {
      throw new BadRequestException(
        `Failed to fetch earnings: ${error.message}`,
      );
    }

    // Calculate summary
    const summary = await this.getEarningsSummary(instructorId);

    return {
      earnings: data || [],
      summary,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  async getEarningsSummary(instructorId: string) {
    const supabase = this.getSupabaseClient();

    // Total earnings
    const { data: totalData } = await supabase
      .from("instructor_earnings")
      .select("instructor_earnings, platform_fee, status")
      .eq("instructor_id", instructorId);

    const totalEarnings =
      totalData?.reduce((sum, e) => sum + (e.instructor_earnings || 0), 0) || 0;
    const totalPlatformFees =
      totalData?.reduce((sum, e) => sum + (e.platform_fee || 0), 0) || 0;

    const availableEarnings =
      totalData
        ?.filter((e) => e.status === "available")
        .reduce((sum, e) => sum + (e.instructor_earnings || 0), 0) || 0;

    const pendingEarnings =
      totalData
        ?.filter((e) => e.status === "pending")
        .reduce((sum, e) => sum + (e.instructor_earnings || 0), 0) || 0;

    const paidEarnings =
      totalData
        ?.filter((e) => e.status === "paid")
        .reduce((sum, e) => sum + (e.instructor_earnings || 0), 0) || 0;

    // This month's earnings
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: monthlyData } = await supabase
      .from("instructor_earnings")
      .select("instructor_earnings")
      .eq("instructor_id", instructorId)
      .gte("created_at", startOfMonth.toISOString());

    const thisMonthEarnings =
      monthlyData?.reduce((sum, e) => sum + (e.instructor_earnings || 0), 0) ||
      0;

    // Course breakdown
    const { data: courseBreakdown } = await supabase
      .from("instructor_earnings")
      .select("course_id, instructor_earnings")
      .eq("instructor_id", instructorId)
      .eq("status", "available");

    const courseMap = new Map();
    for (const earning of courseBreakdown || []) {
      courseMap.set(
        earning.course_id,
        (courseMap.get(earning.course_id) || 0) + earning.instructor_earnings,
      );
    }

    // Get course titles
    const topCourses = [];
    for (const [courseId, amount] of courseMap.entries()) {
      const { data: course } = await supabase
        .from("courses")
        .select("title")
        .eq("id", courseId)
        .single();
      topCourses.push({
        course_id: courseId,
        title: course?.title || "Unknown Course",
        earnings: amount,
      });
    }
    topCourses.sort((a, b) => b.earnings - a.earnings);

    return {
      total_earnings: totalEarnings,
      total_platform_fees: totalPlatformFees,
      available_balance: availableEarnings,
      pending_balance: pendingEarnings,
      paid_balance: paidEarnings,
      this_month_earnings: thisMonthEarnings,
      top_courses: topCourses.slice(0, 5),
      total_transactions: totalData?.length || 0,
    };
  }

  async getRevenueAnalytics(instructorId: string, days = 30) {
    const supabase = this.getSupabaseClient();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from("revenue_analytics")
      .select("*")
      .eq("instructor_id", instructorId)
      .gte("date", startDate.toISOString().split("T")[0])
      .order("date", { ascending: true });

    if (error) {
      throw new BadRequestException(
        `Failed to fetch analytics: ${error.message}`,
      );
    }

    // Get daily sales from earnings
    const { data: dailyEarnings } = await supabase
      .from("instructor_earnings")
      .select("created_at, instructor_earnings, course_price")
      .eq("instructor_id", instructorId)
      .gte("created_at", startDate.toISOString());

    const dailyData = new Map();
    dailyEarnings?.forEach((earning) => {
      const date = new Date(earning.created_at).toISOString().split("T")[0];
      if (!dailyData.has(date)) {
        dailyData.set(date, { sales: 0, revenue: 0, earnings: 0 });
      }
      const day = dailyData.get(date);
      day.sales += 1;
      day.revenue += earning.course_price || 0;
      day.earnings += earning.instructor_earnings || 0;
    });

    const chartData = Array.from(dailyData.entries()).map(([date, values]) => ({
      date,
      sales: values.sales,
      revenue: values.revenue,
      earnings: values.earnings,
    }));

    return {
      chart_data: chartData,
      total_days: days,
      summary: {
        total_sales: dailyEarnings?.length || 0,
        total_revenue:
          dailyEarnings?.reduce((sum, e) => sum + (e.course_price || 0), 0) ||
          0,
        total_earnings:
          dailyEarnings?.reduce(
            (sum, e) => sum + (e.instructor_earnings || 0),
            0,
          ) || 0,
      },
    };
  }

  // ==================== PAYOUT MANAGEMENT ====================

  async getPayoutSettings(instructorId: string) {
    const supabase = this.getSupabaseClient();

    const { data, error } = await supabase
      .from("instructor_payout_settings")
      .select("*")
      .eq("instructor_id", instructorId)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(
        `Failed to fetch payout settings: ${error.message}`,
      );
    }

    return data || null;
  }

  async updatePayoutSettings(
    instructorId: string,
    settingsDto: PayoutSettingsDto,
  ) {
    const supabase = this.getSupabaseClient();

    const { data, error } = await supabase
      .from("instructor_payout_settings")
      .upsert({
        instructor_id: instructorId,
        ...settingsDto,
        updated_at: new Date(),
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Failed to update payout settings: ${error.message}`,
      );
    }

    return {
      success: true,
      message: "Payout settings updated successfully",
      settings: data,
    };
  }

  async requestPayout(requestDto: RequestPayoutDto) {
    const supabase = this.getSupabaseClient();

    // Check available balance
    const summary = await this.getEarningsSummary(requestDto.instructor_id);

    if (summary.available_balance < requestDto.amount) {
      throw new BadRequestException("Insufficient available balance");
    }

    // Check minimum payout amount
    const settings = await this.getPayoutSettings(requestDto.instructor_id);
    const minAmount = settings?.minimum_payout_amount || 10000; // Default NGN 10,000

    if (requestDto.amount < minAmount) {
      throw new BadRequestException(`Minimum payout amount is ${minAmount}`);
    }

    // Generate unique reference
    const reference = `PO-${Date.now()}-${randomBytes(6).toString("hex")}`;

    // Calculate fee (e.g., 1.5% processing fee)
    const fee = requestDto.amount * 0.015;
    const netAmount = requestDto.amount - fee;

    // Create payout request
    const { data: payout, error } = await supabase
      .from("instructor_payouts")
      .insert({
        instructor_id: requestDto.instructor_id,
        amount: requestDto.amount,
        fee: fee,
        net_amount: netAmount,
        payment_method: requestDto.payment_method || "bank_transfer",
        reference: reference,
        bank_name: settings?.bank_name,
        account_number: settings?.account_number,
        account_name: settings?.account_name,
        status: "pending",
        notes: requestDto.notes,
        metadata: {
          requested_at: new Date(),
          available_balance_before: summary.available_balance,
        },
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Failed to create payout request: ${error.message}`,
      );
    }

    // Mark earnings as pending payout
    await this.markEarningsForPayout(
      requestDto.instructor_id,
      requestDto.amount,
      payout.id,
    );

    return {
      success: true,
      message: "Payout request submitted successfully",
      payout,
    };
  }

  private async markEarningsForPayout(
    instructorId: string,
    amount: number,
    payoutId: string,
  ) {
    const supabase = this.getSupabaseClient();

    // Get available earnings
    const { data: earnings } = await supabase
      .from("instructor_earnings")
      .select("id, instructor_earnings")
      .eq("instructor_id", instructorId)
      .eq("status", "available")
      .order("created_at", { ascending: true });

    let remainingAmount = amount;
    const earningsToUpdate = [];

    for (const earning of earnings || []) {
      if (remainingAmount <= 0) break;

      earningsToUpdate.push(earning.id);
      remainingAmount -= earning.instructor_earnings;
    }

    if (earningsToUpdate.length > 0) {
      await supabase
        .from("instructor_earnings")
        .update({
          status: "pending",
          payout_id: payoutId,
          updated_at: new Date(),
        })
        .in("id", earningsToUpdate);
    }
  }

  async getPayouts(instructorId: string, page = 1, limit = 20) {
    const supabase = this.getSupabaseClient();

    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const { data, error, count } = await supabase
      .from("instructor_payouts")
      .select("*", { count: "exact" })
      .eq("instructor_id", instructorId)
      .order("created_at", { ascending: false })
      .range(start, end);

    if (error) {
      throw new BadRequestException(
        `Failed to fetch payouts: ${error.message}`,
      );
    }

    return {
      payouts: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  async getPayoutById(payoutId: string, instructorId: string) {
    const supabase = this.getSupabaseClient();

    const { data, error } = await supabase
      .from("instructor_payouts")
      .select("*")
      .eq("id", payoutId)
      .eq("instructor_id", instructorId)
      .single();

    if (error || !data) {
      throw new NotFoundException("Payout not found");
    }

    // Get associated earnings
    const { data: earnings } = await supabase
      .from("instructor_earnings")
      .select("*")
      .eq("payout_id", payoutId);

    return {
      payout: data,
      earnings: earnings || [],
    };
  }

  // ==================== ADMIN METHODS ====================

  async getAllPayouts(status?: string, page = 1, limit = 20) {
    const supabase = this.getSupabaseClient();

    let query = supabase
      .from("instructor_payouts")
      .select("*, instructor:instructor_id(id, full_name, email)", {
        count: "exact",
      });

    if (status) {
      query = query.eq("status", status);
    }

    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(start, end);

    if (error) {
      throw new BadRequestException(
        `Failed to fetch payouts: ${error.message}`,
      );
    }

    return {
      payouts: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  async processPayout(processDto: ProcessPayoutDto) {
    const supabase = this.getSupabaseClient();

    const { data: payout, error } = await supabase
      .from("instructor_payouts")
      .update({
        status: "processing",
        processed_at: new Date(),
        metadata: {
          processed_by: processDto.admin_id,
          reference: processDto.reference,
          processed_at: new Date(),
        },
        updated_at: new Date(),
      })
      .eq("id", processDto.payout_id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Failed to process payout: ${error.message}`,
      );
    }

    return {
      success: true,
      message: "Payout is being processed",
      payout,
    };
  }

  async completePayout(payoutId: string, reference: string) {
    const supabase = this.getSupabaseClient();

    const { data: payout, error } = await supabase
      .from("instructor_payouts")
      .update({
        status: "completed",
        completed_at: new Date(),
        reference: reference,
        updated_at: new Date(),
      })
      .eq("id", payoutId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Failed to complete payout: ${error.message}`,
      );
    }

    // Update earnings status to paid
    await supabase
      .from("instructor_earnings")
      .update({
        status: "paid",
        paid_at: new Date(),
        updated_at: new Date(),
      })
      .eq("payout_id", payoutId);

    return {
      success: true,
      message: "Payout completed successfully",
      payout,
    };
  }

  async failPayout(payoutId: string, reason: string) {
    const supabase = this.getSupabaseClient();

    const { data: payout, error } = await supabase
      .from("instructor_payouts")
      .update({
        status: "failed",
        notes: reason,
        updated_at: new Date(),
      })
      .eq("id", payoutId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Failed to mark payout as failed: ${error.message}`,
      );
    }

    // Return earnings back to available
    await supabase
      .from("instructor_earnings")
      .update({
        status: "available",
        payout_id: null,
        updated_at: new Date(),
      })
      .eq("payout_id", payoutId);

    return {
      success: true,
      message:
        "Payout marked as failed. Earnings returned to available balance.",
      payout,
    };
  }

  async getPlatformRevenueStats() {
    const supabase = this.getSupabaseClient();

    // Total platform revenue
    const { data: platformFees } = await supabase
      .from("instructor_earnings")
      .select("platform_fee")
      .eq("status", "available");

    const totalPlatformFees =
      platformFees?.reduce((sum, f) => sum + (f.platform_fee || 0), 0) || 0;

    // Total payouts processed
    const { data: payouts } = await supabase
      .from("instructor_payouts")
      .select("amount, status");

    const totalPayouts =
      payouts
        ?.filter((p) => p.status === "completed")
        .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    const pendingPayouts =
      payouts
        ?.filter((p) => p.status === "pending")
        .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    // Active instructors with earnings
    const { data: activeInstructors } = await supabase
      .from("instructor_earnings")
      .select("instructor_id")
      .eq("status", "available");

    const uniqueInstructors = new Set(
      activeInstructors?.map((e) => e.instructor_id) || [],
    );

    return {
      total_platform_fees: totalPlatformFees,
      total_payouts_processed: totalPayouts,
      pending_payouts: pendingPayouts,
      active_instructors: uniqueInstructors.size,
    };
  }
}
