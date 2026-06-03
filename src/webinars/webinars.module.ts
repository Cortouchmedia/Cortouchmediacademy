// src/webinars/webinars.module.ts
import { Module } from "@nestjs/common";
import { WebinarsController } from "./webinars.controller";
import { WebinarsService } from "./webinars.service";
import { SupabaseService } from "../../supabase.service";

@Module({
  controllers: [WebinarsController],
  providers: [WebinarsService, SupabaseService],
  exports: [WebinarsService],
})
export class WebinarsModule {}
