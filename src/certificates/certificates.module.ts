// src/certificates/certificates.module.ts
import { Module } from "@nestjs/common";
import { CertificatesController } from "./certificates.controller";
import { CertificatesService } from "./certificates.service";
import { SupabaseService } from "../../supabase.service";

@Module({
  controllers: [CertificatesController],
  providers: [CertificatesService, SupabaseService],
  exports: [CertificatesService],
})
export class CertificatesModule {}
