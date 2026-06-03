"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebinarsModule = void 0;
const common_1 = require("@nestjs/common");
const webinars_controller_1 = require("./webinars.controller");
const webinars_service_1 = require("./webinars.service");
const supabase_service_1 = require("../../supabase.service");
let WebinarsModule = class WebinarsModule {
};
exports.WebinarsModule = WebinarsModule;
exports.WebinarsModule = WebinarsModule = __decorate([
    (0, common_1.Module)({
        controllers: [webinars_controller_1.WebinarsController],
        providers: [webinars_service_1.WebinarsService, supabase_service_1.SupabaseService],
        exports: [webinars_service_1.WebinarsService],
    })
], WebinarsModule);
//# sourceMappingURL=webinars.module.js.map