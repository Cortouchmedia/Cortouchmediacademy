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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase.service");
let AuthService = AuthService_1 = class AuthService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async signup(email, full_name, password, role = "STUDENT") {
        this.logger.log(`Signup attempt for email: ${email} with role: ${role}`);
        if (!email || !password || !full_name) {
            this.logger.error("Missing required fields");
            throw new common_1.BadRequestException("Email, password, and full name are required");
        }
        if (password.length < 6) {
            this.logger.error("Password too short");
            throw new common_1.BadRequestException("Password must be at least 6 characters");
        }
        const validRoles = ["STUDENT", "INSTRUCTOR", "ADMIN", "SUPERADMIN"];
        const upperRole = role.toUpperCase();
        if (!validRoles.includes(upperRole)) {
            this.logger.error(`Invalid role: ${role}`);
            throw new common_1.BadRequestException(`Invalid role. Must be one of: ${validRoles.join(", ")}`);
        }
        try {
            const { data: authData, error: authError } = await this.supabaseService
                .getClient()
                .auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name,
                        role: upperRole,
                    },
                },
            });
            if (authError) {
                this.logger.error(`Signup error for ${email}: ${authError.message}`);
                if (authError.message.includes("already registered")) {
                    throw new common_1.BadRequestException("User already registered with this email");
                }
                if (authError.message.includes("rate limit")) {
                    throw new common_1.BadRequestException("Too many signup attempts. Please try again later");
                }
                throw new common_1.UnauthorizedException(authError.message);
            }
            this.logger.log(`Signup successful for email: ${email}`);
            if (authData.user) {
                await this.createUserProfile(authData.user.id, email, full_name, upperRole);
            }
            return {
                message: "Signup successful",
                user: authData.user,
                session: authData.session,
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            this.logger.error(`Unexpected signup error: ${error?.message || "Unknown error"}`);
            throw new common_1.UnauthorizedException("Signup failed. Please try again.");
        }
    }
    async signin(email, pass) {
        this.logger.log(`Signin attempt for email: ${email}`);
        if (!email || !pass) {
            this.logger.error("Email or password missing");
            throw new common_1.BadRequestException("Email and password are required");
        }
        try {
            const { data, error } = await this.supabaseService
                .getClient()
                .auth.signInWithPassword({
                email,
                password: pass,
            });
            if (error) {
                this.logger.error(`Signin error for ${email}: ${error.message}`);
                if (error.message.includes("Invalid login credentials")) {
                    throw new common_1.UnauthorizedException("Invalid email or password");
                }
                if (error.message.includes("Email not confirmed")) {
                    throw new common_1.UnauthorizedException("Please confirm your email before signing in");
                }
                throw new common_1.UnauthorizedException(error.message);
            }
            this.logger.log(`Signin successful for email: ${email}`);
            return {
                message: "Signin successful",
                user: data.user,
                session: data.session,
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            this.logger.error(`Unexpected signin error: ${error?.message || "Unknown error"}`);
            throw new common_1.UnauthorizedException("Signin failed. Please try again.");
        }
    }
    async signOut() {
        this.logger.log("Signout attempt");
        try {
            const supabase = this.supabaseService.getClient();
            const { error } = await supabase.auth.signOut();
            if (error) {
                this.logger.error(`Signout error: ${error.message}`);
                throw new common_1.UnauthorizedException(error.message);
            }
            this.logger.log("Signout successful");
            return { message: "Signed out successfully" };
        }
        catch (error) {
            this.logger.error(`Unexpected signout error: ${error?.message || "Unknown error"}`);
            throw new common_1.UnauthorizedException("Signout failed. Please try again.");
        }
    }
    async createUserProfile(userId, email, full_name, role) {
        this.logger.log(`Creating profile for user: ${userId}`);
        try {
            const supabaseAdmin = this.supabaseService.getAdminClient();
            if (!supabaseAdmin) {
                this.logger.error("Admin client not available, cannot create profile");
                return null;
            }
            const { data, error } = await supabaseAdmin
                .from("profiles")
                .insert({
                id: userId,
                email: email,
                full_name: full_name,
                role: role,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
                .select()
                .single();
            if (error) {
                this.logger.error(`Profile creation error for ${userId}: ${error.message}`);
                return null;
            }
            this.logger.log(`Profile created successfully for user: ${userId}`);
            return data;
        }
        catch (error) {
            this.logger.error(`Unexpected profile creation error: ${error?.message || "Unknown error"}`);
            return null;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], AuthService);
//# sourceMappingURL=auth.service.js.map