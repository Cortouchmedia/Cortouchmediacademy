// src/payments/payments.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import {
  InitializePaymentDto,
  VerifyPaymentDto,
  CreatePlanDto,
  CreateSubscriptionDto,
  CancelSubscriptionDto,
} from "./dto/payment.dto";
import { PaystackService } from "./paystack.service";

@Controller("api/payments")
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly paystackService: PaystackService,
  ) {}

  // ==================== PAYMENT INITIATION ====================

  @Post("initialize")
  async initializePayment(@Body() initDto: InitializePaymentDto) {
    return this.paymentsService.initializePayment(initDto);
  }

  @Get("verify")
  async verifyPayment(@Query("reference") reference: string) {
    if (!reference) {
      throw new BadRequestException("Reference is required");
    }
    return this.paymentsService.verifyPayment({ reference });
  }

  // ==================== WEBHOOK ====================

  @Post("webhook")
  async handleWebhook(
    @Body() payload: any,
    @Headers("x-paystack-signature") signature: string,
  ) {
    this.logger.log(`Received webhook event: ${payload.event}`);

    // Verify webhook signature
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const crypto = require("crypto");
    const hash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(payload))
      .digest("hex");

    if (hash !== signature) {
      this.logger.error("Invalid webhook signature");
      throw new BadRequestException("Invalid webhook signature");
    }

    const event = payload.event;
    const data = payload.data;

    switch (event) {
      case "charge.success":
        await this.handleSuccessfulCharge(data);
        break;
      case "subscription.disable":
        await this.handleSubscriptionDisabled(data);
        break;
      case "invoice.payment_failed":
        await this.handleFailedPayment(data);
        break;
      case "subscription.create":
        await this.handleSubscriptionCreated(data);
        break;
      default:
        this.logger.log(`Unhandled event: ${event}`);
    }

    return { received: true };
  }

  private async handleSuccessfulCharge(data: any) {
    const reference = data.reference;
    await this.paymentsService.verifyPayment({ reference });
  }

  private async handleSubscriptionDisabled(data: any) {
    this.logger.log(`Subscription disabled: ${data.subscription_code}`);
  }

  private async handleFailedPayment(data: any) {
    this.logger.error(`Failed payment: ${data.reference}`);
  }

  private async handleSubscriptionCreated(data: any) {
    this.logger.log(`Subscription created: ${data.subscription_code}`);
  }

  // ==================== TRANSACTIONS ====================

  @Get("user/:userId/transactions")
  async getUserTransactions(
    @Param("userId") userId: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.paymentsService.getUserTransactions(
      userId,
      page ? +page : 1,
      limit ? +limit : 20,
    );
  }

  @Get("revenue/course/:courseId")
  async getCourseRevenue(
    @Param("courseId") courseId: string,
    @Query("instructorId") instructorId: string,
  ) {
    return this.paymentsService.getCourseRevenue(courseId, instructorId);
  }

  @Get("revenue/platform")
  async getPlatformRevenue() {
    return this.paymentsService.getPlatformRevenue();
  }

  // ==================== SUBSCRIPTIONS ====================

  @Post("plans")
  async createPlan(@Body() createPlanDto: CreatePlanDto) {
    return this.paymentsService.createPlan(createPlanDto);
  }

  @Post("subscriptions")
  async createSubscription(@Body() subscriptionDto: CreateSubscriptionDto) {
    return this.paymentsService.createSubscription(subscriptionDto);
  }

  @Get("subscriptions/user/:userId/course/:courseId")
  async getUserSubscription(
    @Param("userId") userId: string,
    @Param("courseId") courseId: string,
  ) {
    return this.paymentsService.getUserSubscription(userId, courseId);
  }

  @Post("subscriptions/cancel")
  async cancelSubscription(@Body() cancelDto: CancelSubscriptionDto) {
    return this.paymentsService.cancelSubscription(cancelDto);
  }

  @Get("user/:userId/history")
  async getPaymentHistory(
    @Param("userId") userId: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.paymentsService.getPaymentHistory(
      userId,
      page ? +page : 1,
      limit ? +limit : 20,
    );
  }

  // ==================== REFUNDS ====================

  @Post("refund/:transactionId")
  async refundTransaction(
    @Param("transactionId") transactionId: string,
    @Body("amount") amount?: number,
  ) {
    return this.paymentsService.refundTransaction(transactionId, amount);
  }
}
