// src/assets/assets.module.ts
import { Module } from "@nestjs/common";
import { AssetsController } from "./assets.controller";
import { AssetsService } from "./assets.service";
import { CloudinaryModule } from "../cloudinary/cloudinarymodule";
import { CloudinaryService } from "../cloudinary/cloudinary.service";

@Module({
  imports: [CloudinaryModule],
  controllers: [AssetsController],
  providers: [AssetsService, CloudinaryService],
  exports: [AssetsService],
})
export class AssetsModule {}
