// src/projects/projects.module.ts
import { Module } from "@nestjs/common";
import { ProjectsController } from "./projects.controller";
import { ProjectsService } from "./projects.service";
import { CloudinaryModule } from "../cloudinary/cloudinarymodule";
import { CloudinaryService } from "../cloudinary/cloudinary.service";

@Module({
  imports: [CloudinaryModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, CloudinaryService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
