import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AiAssistantController } from "./ai-assistant.controller";
import { AiAssistantService } from "./ai-assistant.service";
import { SupabaseModule } from "../supabase/supabase.module";

@Module({
  imports: [ConfigModule, SupabaseModule],
  controllers: [AiAssistantController],
  providers: [AiAssistantService],
  exports: [AiAssistantService],
})
export class AiAssistantModule {}