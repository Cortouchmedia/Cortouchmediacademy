// src/courses/courses.module.ts
import { Module } from "@nestjs/common";
import { CoursesController } from "./courses.controller";
import { CoursesService } from "./courses.service";
import { SupabaseService } from "supabase.service";

@Module({
  controllers: [CoursesController],
  providers: [CoursesService, SupabaseService],
  exports: [CoursesService],
})
export class CoursesModule {}
