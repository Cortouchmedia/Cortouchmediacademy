// src/ai/ai-assistant.module.ts
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config"; // Add this
import { AiAssistantController } from "./ai-assistant.controller";
import { AiAssistantService } from "./ai-assistant.service";
import { SupabaseService } from "../../supabase.service";

@Module({
  imports: [ConfigModule], // Add this
  controllers: [AiAssistantController],
  providers: [AiAssistantService, SupabaseService],
  exports: [AiAssistantService],
})
export class AiAssistantModule {}
