// src/projects/projects.module.ts
import { Module } from "@nestjs/common";
import { ProjectsController } from "./projects.controller";
import { ProjectsService } from "./projects.service";
import { SupabaseService } from "../../supabase.service";
import { CloudinaryModule } from "src/cloudinary/cloudinarymodule";
import { CloudinaryService } from "../cloudinary/cloudinary.service";

@Module({
  imports: [CloudinaryModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, SupabaseService, CloudinaryService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
