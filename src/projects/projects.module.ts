import { Module } from "@nestjs/common";
import { ProjectsController } from "./projects.controller";
import { ProjectsService } from "./projects.service";
import { CloudinaryModule } from "../cloudinary/cloudinarymodule";
import { AiAssistantModule } from "../ai/ai-assistant.module";

@Module({
  imports: [CloudinaryModule, AiAssistantModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}