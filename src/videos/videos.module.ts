// src/videos/videos.module.ts
import { Module } from "@nestjs/common";
import { VideosController } from "./videos.controller";
import { VideosService } from "./videos.service";
import { CloudinaryModule } from "../cloudinary/cloudinarymodule";

@Module({
  imports: [CloudinaryModule],
  controllers: [VideosController],
  providers: [VideosService],
  exports: [VideosService],
})
export class VideosModule {}
