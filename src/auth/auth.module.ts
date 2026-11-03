import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { SupabaseModule } from "../supabase/supabase.module"; 

@Module({
  imports: [
    ConfigModule,
    SupabaseModule, // 👈 ADD THIS
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService], 
})
export class AuthModule {}