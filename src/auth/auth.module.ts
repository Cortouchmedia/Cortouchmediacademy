import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PassportModule } from "@nestjs/passport"; 
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { SupabaseModule } from "../supabase/supabase.module"; 
import { JwtStrategy } from "./jwt.strategy"; 

@Module({
  imports: [
    ConfigModule,
    SupabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }), 
  ],
  providers: [
    AuthService,
    JwtStrategy, // 
  ],
  controllers: [AuthController],
  exports: [AuthService], 
})
export class AuthModule {}