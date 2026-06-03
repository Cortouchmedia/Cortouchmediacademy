"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SupabaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
let SupabaseService = SupabaseService_1 = class SupabaseService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(SupabaseService_1.name);
    }
    onModuleInit() {
        const supabaseUrl = this.configService.get("SUPABASE_URL") ||
            this.configService.get("NEXT_PUBLIC_SUPABASE_URL");
        const supabaseKey = this.configService.get("SUPABASE_ANON_KEY") ||
            this.configService.get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY");
        const supabaseServiceKey = this.configService.get("SUPABASE_SERVICE_ROLE_KEY");
        this.logger.log(`SUPABASE_URL: ${supabaseUrl ? "✅ Found" : "❌ Missing"}`);
        this.logger.log(`SUPABASE_ANON_KEY: ${supabaseKey ? "✅ Found" : "❌ Missing"}`);
        this.logger.log(`SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? "✅ Found (length: " + supabaseServiceKey.length + ")" : "❌ Missing"}`);
        if (supabaseServiceKey) {
            this.logger.log(`Service key prefix: ${supabaseServiceKey.substring(0, 30)}...`);
        }
        if (!supabaseUrl || !supabaseKey) {
            this.logger.error("Supabase credentials are missing!");
            this.logger.error("Please ensure SUPABASE_URL and SUPABASE_ANON_KEY are set in .env");
            throw new Error("Supabase configuration is incomplete");
        }
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
        });
        this.logger.log("Supabase client initialized successfully");
        if (supabaseServiceKey &&
            supabaseServiceKey !== "your-service-role-key-here") {
            try {
                this.supabaseAdmin = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey, {
                    auth: {
                        persistSession: false,
                        autoRefreshToken: false,
                    },
                });
                this.logger.log("✅ Supabase admin client initialized successfully");
            }
            catch (error) {
                this.logger.error(`Failed to create admin client: ${error?.message || error}`);
                this.supabaseAdmin = this.supabase;
            }
        }
        else {
            this.logger.warn("SUPABASE_SERVICE_ROLE_KEY not provided or is placeholder. Admin operations will fail.");
            this.supabaseAdmin = this.supabase;
            this.logger.warn("⚠️ Using regular client as fallback for admin operations");
        }
    }
    getClient() {
        if (!this.supabase) {
            throw new Error("Supabase client not initialized. Check your configuration.");
        }
        return this.supabase;
    }
    getAdminClient() {
        if (!this.supabaseAdmin) {
            this.logger.warn("Admin client not available, falling back to regular client");
            return this.getClient();
        }
        return this.supabaseAdmin;
    }
};
exports.SupabaseService = SupabaseService;
exports.SupabaseService = SupabaseService = SupabaseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SupabaseService);
//# sourceMappingURL=supabase.service.js.map