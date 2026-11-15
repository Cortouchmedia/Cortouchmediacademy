import { Module } from "@nestjs/common";
import { CoursesController } from "./courses.controller";
import { CoursesService } from "./courses.service";
import { CertificatesModule } from "../certificates/certificates.module";
import { CloudinaryModule } from "../cloudinary/cloudinarymodule";

@Module({
  imports: [CertificatesModule, CloudinaryModule],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}