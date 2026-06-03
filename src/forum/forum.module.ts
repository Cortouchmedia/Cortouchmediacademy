// src/forum/forum.module.ts
import { Module } from "@nestjs/common";
import { ForumController } from "./forum.controller";
import { ForumService } from "./forum.service";
import { SupabaseService } from "../../supabase.service";

@Module({
  controllers: [ForumController],
  providers: [ForumService, SupabaseService],
  exports: [ForumService],
})
export class ForumModule {}
