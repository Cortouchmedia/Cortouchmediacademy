// src/revenue/revenue.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  BadRequestException,
  UseGuards,
  ForbiddenException,
} from "@nestjs/common";
import { RevenueService } from "./revenue.service";
import {
  PayoutSettingsDto,
  RequestPayoutDto,
  ProcessPayoutDto,
  EarningsFilterDto,
} from "./dto/revenue.dto";
import { SupabaseAuthGuard } from "../auth/supabase-auth.guard";
import { AdminGuard } from "../auth/admin.guard";
import { CurrentUser } from "../auth/current-user.decorator";

type AuthUser = { id: string; email?: string; role?: string };

@Controller("api/revenue")
export class RevenueController {
  constructor(private readonly revenueService: RevenueService) {}

  // ==================== EARNINGS (INSTRUCTOR) ====================

  @Get("instructor/:instructorId/earnings")
  @UseGuards(SupabaseAuthGuard)
  async getInstructorEarnings(
    @Param("instructorId") instructorId: string,
    @CurrentUser() user: AuthUser,
    @Query("start_date") start_date?: string,
    @Query("end_date") end_date?: string,
    @Query("course_id") course_id?: string,
    @Query("status") status?: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    const role = (user.role ?? "").toUpperCase();
    const isAdmin = role === "ADMIN" || role === "SUPERADMIN";
    if (user.id !== instructorId && !isAdmin) {
      throw new ForbiddenException("You can only view your own earnings");
    }
    return this.revenueService.getInstructorEarnings(instructorId, {
      start_date: start_date ? new Date(start_date) : undefined,
      end_date: end_date ? new Date(end_date) : undefined,
      course_id,
      status,
      page: page ? +page : 1,
      limit: limit ? +limit : 20,
    });
  }

  @Get("instructor/:instructorId/summary")
  @UseGuards(SupabaseAuthGuard)
  async getEarningsSummary(
    @Param("instructorId") instructorId: string,
    @CurrentUser() user: AuthUser,
  ) {
    const role = (user.role ?? "").toUpperCase();
    const isAdmin = role === "ADMIN" || role === "SUPERADMIN";
    if (user.id !== instructorId && !isAdmin) {
      throw new ForbiddenException("You can only view your own earnings");
    }
    return this.revenueService.getEarningsSummary(instructorId);
  }

  @Get("instructor/:instructorId/analytics")
  @UseGuards(SupabaseAuthGuard)
  async getRevenueAnalytics(
    @Param("instructorId") instructorId: string,
    @CurrentUser() user: AuthUser,
    @Query("days") days?: number,
  ) {
    const role = (user.role ?? "").toUpperCase();
    const isAdmin = role === "ADMIN" || role === "SUPERADMIN";
    if (user.id !== instructorId && !isAdmin) {
      throw new ForbiddenException("You can only view your own analytics");
    }
    return this.revenueService.getRevenueAnalytics(
      instructorId,
      days ? +days : 30,
    );
  }

  // ==================== PAYOUT SETTINGS ====================

  @Get("instructor/:instructorId/payout-settings")
  @UseGuards(SupabaseAuthGuard)
  async getPayoutSettings(
    @Param("instructorId") instructorId: string,
    @CurrentUser() user: AuthUser,
  ) {
    const role = (user.role ?? "").toUpperCase();
    const isAdmin = role === "ADMIN" || role === "SUPERADMIN";
    if (user.id !== instructorId && !isAdmin) {
      throw new ForbiddenException("Not authorized");
    }
    return this.revenueService.getPayoutSettings(instructorId);
  }

  @Put("instructor/:instructorId/payout-settings")
  @UseGuards(SupabaseAuthGuard)
  async updatePayoutSettings(
    @Param("instructorId") instructorId: string,
    @Body() settingsDto: PayoutSettingsDto,
    @CurrentUser() user: AuthUser,
  ) {
    const role = (user.role ?? "").toUpperCase();
    const isAdmin = role === "ADMIN" || role === "SUPERADMIN";
    if (user.id !== instructorId && !isAdmin) {
      throw new ForbiddenException("Not authorized");
    }
    return this.revenueService.updatePayoutSettings(instructorId, settingsDto);
  }

  // ==================== PAYOUTS (INSTRUCTOR) ====================

  @Post("payouts/request")
  @UseGuards(SupabaseAuthGuard)
  async requestPayout(
    @Body() requestDto: RequestPayoutDto,
    @CurrentUser() user: AuthUser,
  ) {
    if (user.id !== requestDto.instructor_id) {
      throw new ForbiddenException("You can only request your own payout");
    }
    return this.revenueService.requestPayout(requestDto);
  }

  @Get("instructor/:instructorId/payouts")
  @UseGuards(SupabaseAuthGuard)
  async getPayouts(
    @Param("instructorId") instructorId: string,
    @CurrentUser() user: AuthUser,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    const role = (user.role ?? "").toUpperCase();
    const isAdmin = role === "ADMIN" || role === "SUPERADMIN";
    if (user.id !== instructorId && !isAdmin) {
      throw new ForbiddenException("Not authorized");
    }
    return this.revenueService.getPayouts(
      instructorId,
      page ? +page : 1,
      limit ? +limit : 20,
    );
  }

  @Get("instructor/:instructorId/payouts/:payoutId")
  @UseGuards(SupabaseAuthGuard)
  async getPayoutById(
    @Param("instructorId") instructorId: string,
    @Param("payoutId") payoutId: string,
    @CurrentUser() user: AuthUser,
  ) {
    const role = (user.role ?? "").toUpperCase();
    const isAdmin = role === "ADMIN" || role === "SUPERADMIN";
    if (user.id !== instructorId && !isAdmin) {
      throw new ForbiddenException("Not authorized");
    }
    return this.revenueService.getPayoutById(payoutId, instructorId);
  }

  // ==================== ADMIN ENDPOINTS ====================

  @Get("admin/payouts")
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  async getAllPayouts(
    @Query("status") status?: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.revenueService.getAllPayouts(
      status,
      page ? +page : 1,
      limit ? +limit : 20,
    );
  }

  @Post("admin/payouts/process")
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  async processPayout(@Body() processDto: ProcessPayoutDto) {
    return this.revenueService.processPayout(processDto);
  }

  @Post("admin/payouts/:payoutId/complete")
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  async completePayout(
    @Param("payoutId") payoutId: string,
    @Body("reference") reference: string,
  ) {
    if (!reference) {
      throw new BadRequestException("Transaction reference is required");
    }
    return this.revenueService.completePayout(payoutId, reference);
  }

  @Post("admin/payouts/:payoutId/fail")
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  async failPayout(
    @Param("payoutId") payoutId: string,
    @Body("reason") reason: string,
  ) {
    if (!reason) {
      throw new BadRequestException("Failure reason is required");
    }
    return this.revenueService.failPayout(payoutId, reason);
  }

  @Get("admin/platform-stats")
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  async getPlatformRevenueStats() {
    return this.revenueService.getPlatformRevenueStats();
  }

  @Post("admin/initiate")
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  async adminInitiatePayout(
    @Body() dto: any,
    @CurrentUser() user: AuthUser,
  ) {
    return this.revenueService.adminInitiatePayout(user.id, dto);
  }
}