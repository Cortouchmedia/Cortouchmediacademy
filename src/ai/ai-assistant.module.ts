// src/ai/ai-assistant.module.ts
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config"; // Add this
import { AiAssistantController } from "./ai-assistant.controller";
import { AiAssistantService } from "./ai-assistant.service";

@Module({
  imports: [ConfigModule], // Add this
  controllers: [AiAssistantController],
  providers: [AiAssistantService],
  exports: [AiAssistantService],
})
export class AiAssistantModule {}
