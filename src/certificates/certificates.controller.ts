// src/certificates/certificates.controller.ts
import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Req,
  Body,
} from "@nestjs/common";
import { CertificatesService } from "./certificates.service";

@Controller("api/certificates")
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get("my-certificates")
  async getMyCertificates(@Query("userId") userId: string) {
    return this.certificatesService.getUserCertificates(userId);
  }

  @Get("user/:userId/course/:courseId")
  async getCertificateByCourse(
    @Param("userId") userId: string,
    @Param("courseId") courseId: string,
  ) {
    return this.certificatesService.getCertificateByCourse(userId, courseId);
  }

  @Get("verify/:code")
  async verifyCertificate(@Param("code") code: string) {
    return this.certificatesService.verifyCertificate(code);
  }

  @Post("generate")
  async generateCertificate(
    @Body("userId") userId: string,
    @Body("courseId") courseId: string,
    @Body("grade") grade?: string,
  ) {
    return this.certificatesService.generateManualCertificate(
      userId,
      courseId,
      grade,
    );
  }

  @Get(":id")
  async getCertificateById(@Param("id") id: string) {
    return this.certificatesService.getCertificateById(id);
  }

  @Get("admin/all")
  async getAllCertificates(
    @Query("limit") limit = 50,
    @Query("offset") offset = 0,
  ) {
    return this.certificatesService.getAllCertificates(limit, offset);
  }

  @Get("admin/stats")
  async getCertificateStats() {
    return this.certificatesService.getCertificateStats();
  }
}
