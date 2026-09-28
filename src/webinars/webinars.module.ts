// src/webinars/webinars.module.ts
import { Module } from "@nestjs/common";
import { WebinarsController } from "./webinars.controller";
import { WebinarsService } from "./webinars.service";

@Module({
  controllers: [WebinarsController],
  providers: [WebinarsService],
  exports: [WebinarsService],
})
export class WebinarsModule {}
