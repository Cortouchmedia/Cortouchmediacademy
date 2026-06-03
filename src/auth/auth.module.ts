import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { SupabaseService } from "../../supabase.service"; // Changed path to look one level up

@Module({
  imports: [
    ConfigModule, // This fixes the "UnknownDependenciesException"
  ],
  providers: [AuthService, SupabaseService],
  controllers: [AuthController],
  exports: [AuthService, SupabaseService], // Export it if other modules need it too
})
export class AuthModule {}
