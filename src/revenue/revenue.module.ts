// src/revenue/revenue.module.ts
import { Module } from "@nestjs/common";
import { RevenueController } from "./revenue.controller";
import { RevenueService } from "./revenue.service";
import { SupabaseService } from "../../supabase.service";

@Module({
  controllers: [RevenueController],
  providers: [RevenueService, SupabaseService],
  exports: [RevenueService],
})
export class RevenueModule {}
