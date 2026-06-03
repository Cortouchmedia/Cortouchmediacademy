// src/videos/videos.module.ts
import { Module } from "@nestjs/common";
import { VideosController } from "./videos.controller";
import { VideosService } from "./videos.service";
import { SupabaseService } from "../../supabase.service";
import { CloudinaryModule } from "src/cloudinary/cloudinarymodule";

@Module({
  imports: [CloudinaryModule],
  controllers: [VideosController],
  providers: [VideosService, SupabaseService],
  exports: [VideosService],
})
export class VideosModule {}
