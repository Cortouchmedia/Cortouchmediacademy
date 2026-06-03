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
} from "@nestjs/common";
import { RevenueService } from "./revenue.service";
import {
  PayoutSettingsDto,
  RequestPayoutDto,
  ProcessPayoutDto,
  UpdatePayoutStatusDto,
  EarningsFilterDto,
} from "./dto/revenue.dto";

@Controller("api/revenue")
export class RevenueController {
  constructor(private readonly revenueService: RevenueService) {}

  // ==================== EARNINGS ====================

  @Get("instructor/:instructorId/earnings")
  async getInstructorEarnings(
    @Param("instructorId") instructorId: string,
    @Query("start_date") start_date?: string,
    @Query("end_date") end_date?: string,
    @Query("course_id") course_id?: string,
    @Query("status") status?: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
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
  async getEarningsSummary(@Param("instructorId") instructorId: string) {
    return this.revenueService.getEarningsSummary(instructorId);
  }

  @Get("instructor/:instructorId/analytics")
  async getRevenueAnalytics(
    @Param("instructorId") instructorId: string,
    @Query("days") days?: number,
  ) {
    return this.revenueService.getRevenueAnalytics(
      instructorId,
      days ? +days : 30,
    );
  }

  // ==================== PAYOUT SETTINGS ====================

  @Get("instructor/:instructorId/payout-settings")
  async getPayoutSettings(@Param("instructorId") instructorId: string) {
    return this.revenueService.getPayoutSettings(instructorId);
  }

  @Put("instructor/:instructorId/payout-settings")
  async updatePayoutSettings(
    @Param("instructorId") instructorId: string,
    @Body() settingsDto: PayoutSettingsDto,
  ) {
    return this.revenueService.updatePayoutSettings(instructorId, settingsDto);
  }

  // ==================== PAYOUTS ====================

  @Post("payouts/request")
  async requestPayout(@Body() requestDto: RequestPayoutDto) {
    return this.revenueService.requestPayout(requestDto);
  }

  @Get("instructor/:instructorId/payouts")
  async getPayouts(
    @Param("instructorId") instructorId: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.revenueService.getPayouts(
      instructorId,
      page ? +page : 1,
      limit ? +limit : 20,
    );
  }

  @Get("instructor/:instructorId/payouts/:payoutId")
  async getPayoutById(
    @Param("instructorId") instructorId: string,
    @Param("payoutId") payoutId: string,
  ) {
    return this.revenueService.getPayoutById(payoutId, instructorId);
  }

  // ==================== ADMIN ENDPOINTS ====================

  @Get("admin/payouts")
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
  async processPayout(@Body() processDto: ProcessPayoutDto) {
    return this.revenueService.processPayout(processDto);
  }

  @Post("admin/payouts/:payoutId/complete")
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
  async getPlatformRevenueStats() {
    return this.revenueService.getPlatformRevenueStats();
  }
}
