// src/payments/payments.module.ts
import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";
import { PaystackService } from "./paystack.service";

@Module({
  imports: [HttpModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaystackService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
