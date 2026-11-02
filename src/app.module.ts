import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { SupabaseModule } from './supabase/supabase.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';
import { CertificatesModule } from './certificates/certificates.module';
import { ForumModule } from './forum/forum.module';
import { AiAssistantModule } from './ai/ai-assistant.module';
import { WebinarsModule } from './webinars/webinars.module';
import { VideosModule } from './videos/videos.module';
import { CloudinaryModule } from './cloudinary/cloudinarymodule';
import { AssetsModule } from './assets/assets.module';
import { ProjectsModule } from './projects/projects.module';
import { PaymentsModule } from './payments/payments.module';
import { RevenueModule } from './revenue/revenue.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    SupabaseModule,   

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
  providers: [AppService],   
})
export class AppModule {}
