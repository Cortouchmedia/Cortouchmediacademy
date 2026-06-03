"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const supabase_service_1 = require("./supabase.service");
const auth_module_1 = require("./src/auth/auth.module");
const users_module_1 = require("./src/users/users.module");
const courses_module_1 = require("./src/courses/courses.module");
const certificates_module_1 = require("./src/certificates/certificates.module");
const forum_module_1 = require("./src/forum/forum.module");
const ai_assistant_module_1 = require("./src/ai/ai-assistant.module");
const webinars_module_1 = require("./src/webinars/webinars.module");
const videos_module_1 = require("./src/videos/videos.module");
const cloudinarymodule_1 = require("./src/cloudinary/cloudinarymodule");
const assets_module_1 = require("./src/assets/assets.module");
const projects_module_1 = require("./src/projects/projects.module");
const payments_module_1 = require("./src/payments/payments.module");
const revenue_module_1 = require("./src/revenue/revenue.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            courses_module_1.CoursesModule,
            certificates_module_1.CertificatesModule,
            forum_module_1.ForumModule,
            ai_assistant_module_1.AiAssistantModule,
            webinars_module_1.WebinarsModule,
            videos_module_1.VideosModule,
            cloudinarymodule_1.CloudinaryModule,
            assets_module_1.AssetsModule,
            projects_module_1.ProjectsModule,
            payments_module_1.PaymentsModule,
            revenue_module_1.RevenueModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, supabase_service_1.SupabaseService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map