import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { SupabaseService } from "./supabase.service";

import { AuthModule } from "./src/auth/auth.module";
import { UsersModule } from "./src/users/users.module";
import { CoursesModule } from "./src/courses/courses.module";
import { CertificatesModule } from "./src/certificates/certificates.module";
import { ForumModule } from "./src/forum/forum.module";
import { AiAssistantModule } from "src/ai/ai-assistant.module";
import { WebinarsModule } from "./src/webinars/webinars.module";
import { VideosModule } from "src/videos/videos.module";
import { CloudinaryModule } from "src/cloudinary/cloudinarymodule";
import { AssetsModule } from "src/assets/assets.module";
import { ProjectsModule } from "src/projects/projects.module";
import { PaymentsModule } from "src/payments/payments.module";
import { RevenueModule } from "src/revenue/revenue.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Crucial for SupabaseService to find your keys
    }),
    AuthModule,
    UsersModule,
    CoursesModule,
    CertificatesModule,
    ForumModule,
    AiAssistantModule,
    WebinarsModule,
    VideosModule,
    CloudinaryModule,
    AssetsModule,
    ProjectsModule,
    PaymentsModule,
    RevenueModule,
  ],
  controllers: [AppController],
  providers: [AppService, SupabaseService],
})
export class AppModule {}
