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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const supabase_service_1 = require("../../supabase.service");
const register_dto_1 = require("./dto/register.dto");
let AuthController = AuthController_1 = class AuthController {
    constructor(authService, supabaseService) {
        this.authService = authService;
        this.supabaseService = supabaseService;
        this.logger = new common_1.Logger(AuthController_1.name);
        this.logger.log("AuthController initialized");
    }
    checkAuthStatus() {
        return { message: "Auth endpoint is working" };
    }
    async signup(registerDto) {
        this.logger.log("Signup endpoint called");
        const { email, password, full_name, role } = registerDto;
        return this.authService.signup(email, full_name, password, role || "STUDENT");
    }
    async signin(body) {
        this.logger.log("Signin endpoint called");
        if (!body) {
            throw new common_1.BadRequestException("Request body is required");
        }
        const { email, password } = body;
        if (!email || !password) {
            throw new common_1.BadRequestException("Email and password are required");
        }
        return this.authService.signin(email, password);
    }
    async signout() {
        this.logger.log("Signout endpoint called");
        return this.authService.signOut();
    }
    async getProfile(req) {
        this.logger.log("Profile endpoint called");
        const supabase = this.supabaseService.getClient();
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            this.logger.error("No token provided");
            throw new common_1.UnauthorizedException("No token provided");
        }
        const token = authHeader.split(" ")[1];
        const { data: { user }, error, } = await supabase.auth.getUser(token);
        if (error || !user) {
            this.logger.error("Invalid token");
            throw new common_1.UnauthorizedException("Invalid token");
        }
        let { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
        if (profileError && profileError.code === "PGRST116") {
            this.logger.log(`Profile not found for user ${user.id}, creating one`);
            const { data: newProfile, error: insertError } = await supabase
                .from("profiles")
                .insert({
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || null,
                role: (user.user_metadata?.role || "STUDENT").toUpperCase(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
                .select()
                .single();
            if (!insertError && newProfile) {
                profile = newProfile;
            }
        }
        return {
            ...user,
            profile: profile || user.user_metadata,
        };
    }
    async updateUser(userId, updateData, req) {
        this.logger.log(`PUT /users - Updating user: ${userId}`);
        if (!userId) {
            throw new common_1.BadRequestException("User ID is required");
        }
        if (updateData.role) {
            updateData.role = updateData.role.toUpperCase();
            if (!["STUDENT", "INSTRUCTOR", "ADMIN", "SUPERADMIN"].includes(updateData.role)) {
                throw new common_1.BadRequestException("Role must be STUDENT, INSTRUCTOR, ADMIN, or SUPERADMIN");
            }
        }
        const supabase = this.supabaseService.getClient();
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            this.logger.error("No token provided");
            throw new common_1.UnauthorizedException("No token provided");
        }
        const token = authHeader.split(" ")[1];
        const { data: { user }, error: userError, } = await supabase.auth.getUser(token);
        if (userError || !user) {
            this.logger.error("Invalid token");
            throw new common_1.UnauthorizedException("Invalid token");
        }
        if (user.id !== userId) {
            this.logger.error(`User ${user.id} tried to update user ${userId}`);
            throw new common_1.UnauthorizedException("You can only update your own profile");
        }
        const updateFields = {};
        if (updateData.full_name !== undefined)
            updateFields.full_name = updateData.full_name;
        if (updateData.role !== undefined)
            updateFields.role = updateData.role;
        updateFields.updated_at = new Date().toISOString();
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .update(updateFields)
            .eq("id", userId)
            .select()
            .single();
        if (profileError) {
            if (profileError.code === "PGRST116") {
                this.logger.log(`Profile not found for user ${userId}, creating new profile`);
                const { data: newProfile, error: insertError } = await supabase
                    .from("profiles")
                    .insert({
                    id: userId,
                    full_name: updateData.full_name || null,
                    role: updateData.role ? updateData.role.toUpperCase() : "STUDENT",
                    email: user.email,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                    .select()
                    .single();
                if (insertError) {
                    this.logger.error(`Profile creation error: ${insertError.message}`);
                    throw new common_1.UnauthorizedException(insertError.message);
                }
                return {
                    message: "Profile created successfully",
                    user: {
                        id: userId,
                        email: user.email,
                        full_name: updateData.full_name || null,
                        role: updateData.role ? updateData.role.toUpperCase() : "STUDENT",
                        profile: newProfile,
                    },
                };
            }
            this.logger.error(`Profile update error: ${profileError.message}`);
            throw new common_1.UnauthorizedException(profileError.message);
        }
        this.logger.log(`User ${userId} updated successfully`);
        return {
            message: "User updated successfully",
            user: {
                id: userId,
                email: user.email,
                full_name: updateData.full_name,
                role: updateData.role,
                profile,
            },
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "checkAuthStatus", null);
__decorate([
    (0, common_1.Post)("signup"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signup", null);
__decorate([
    (0, common_1.Post)("signin"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signin", null);
__decorate([
    (0, common_1.Post)("signout"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signout", null);
__decorate([
    (0, common_1.Get)("profile"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Put)("users"),
    __param(0, (0, common_1.Query)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateUser", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, common_1.Controller)("api/auth"),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        supabase_service_1.SupabaseService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map