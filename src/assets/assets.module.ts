// src/assets/assets.module.ts
import { Module } from "@nestjs/common";
import { AssetsController } from "./assets.controller";
import { AssetsService } from "./assets.service";
import { SupabaseService } from "../../supabase.service";
import { CloudinaryModule } from "src/cloudinary/cloudinarymodule";
import { CloudinaryService } from "../cloudinary/cloudinary.service";

@Module({
  imports: [CloudinaryModule],
  controllers: [AssetsController],
  providers: [AssetsService, SupabaseService, CloudinaryService],
  exports: [AssetsService],
})
export class AssetsModule {}
