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
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase.service");
let UsersService = UsersService_1 = class UsersService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
        this.logger = new common_1.Logger(UsersService_1.name);
    }
    async findAll() {
        try {
            const supabase = this.supabaseService.getClient();
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) {
                this.logger.error(`Failed to fetch profiles: ${error.message}`, error.stack);
                throw new common_1.InternalServerErrorException(`Failed to fetch profiles: ${error.message}`);
            }
            this.logger.log(`Retrieved ${data?.length || 0} profiles`);
            return data || [];
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Unexpected error in findAll: ${error.message}`);
            }
            else {
                this.logger.error(`Unexpected error in findAll: ${String(error)}`);
            }
            throw error;
        }
    }
    async findOne(id) {
        try {
            const supabase = this.supabaseService.getClient();
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", id)
                .maybeSingle();
            if (error) {
                this.logger.error(`Database error for ID ${id}: ${error.message}`, error.stack);
                throw new common_1.InternalServerErrorException(`Database error: ${error.message}`);
            }
            if (!data) {
                this.logger.warn(`Profile with ID ${id} not found`);
                throw new common_1.NotFoundException(`Profile with ID ${id} not found`);
            }
            this.logger.log(`Found profile for ID: ${id}`);
            return data;
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Error in findOne for ID ${id}: ${error.message}`);
            }
            else {
                this.logger.error(`Error in findOne for ID ${id}: ${String(error)}`);
            }
            throw error;
        }
    }
    async findOneOrCreate(id, defaultData) {
        try {
            return await this.findOne(id);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                this.logger.log(`Profile not found for ID ${id}, creating new profile`);
                return await this.create(id, defaultData);
            }
            throw error;
        }
    }
    async create(id, userData) {
        try {
            const supabase = this.supabaseService.getClient();
            const defaultProfile = {
                id: id,
                full_name: userData?.full_name || "",
                email: userData?.email || "",
                location: userData?.location || "",
                website: userData?.website || "",
                about_me: userData?.about_me || "",
                profile_picture: userData?.profile_picture || "",
                role: "STUDENT",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            const { data, error } = await supabase
                .from("profiles")
                .insert(defaultProfile)
                .select()
                .maybeSingle();
            if (error) {
                this.logger.error(`Failed to create profile: ${error.message}`);
                throw new common_1.InternalServerErrorException(`Failed to create profile: ${error.message}`);
            }
            if (!data) {
                throw new common_1.InternalServerErrorException("Failed to create profile: No data returned");
            }
            this.logger.log(`Successfully created profile for ID: ${id}`);
            return data;
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Error in create for ID ${id}: ${error.message}`);
            }
            else {
                this.logger.error(`Error in create for ID ${id}: ${String(error)}`);
            }
            throw error;
        }
    }
    async update(id, updates) {
        try {
            const supabase = this.supabaseService.getClient();
            const { data, error } = await supabase
                .from("profiles")
                .update(updates)
                .eq("id", id)
                .select()
                .maybeSingle();
            if (error) {
                this.logger.error(`Update error for ID ${id}: ${error.message}`, error.stack);
                throw new common_1.InternalServerErrorException(`Update failed: ${error.message}`);
            }
            if (!data) {
                this.logger.warn(`Profile with ID ${id} not found for update`);
                throw new common_1.NotFoundException(`Profile with ID ${id} not found`);
            }
            this.logger.log(`Successfully updated profile for ID: ${id}`);
            return data;
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Error in update for ID ${id}: ${error.message}`);
            }
            else {
                this.logger.error(`Error in update for ID ${id}: ${String(error)}`);
            }
            throw error;
        }
    }
    async adminFindAll() {
        try {
            const supabaseAdmin = this.supabaseService.getAdminClient();
            const { data, error } = await supabaseAdmin.from("profiles").select("*");
            if (error) {
                this.logger.error(`Admin fetch failed: ${error.message}`);
                throw new common_1.InternalServerErrorException(`Admin fetch failed: ${error.message}`);
            }
            return data || [];
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Error in adminFindAll: ${error.message}`);
            }
            else {
                this.logger.error(`Error in adminFindAll: ${String(error)}`);
            }
            throw error;
        }
    }
    async adminUpdate(id, updates) {
        try {
            const supabaseAdmin = this.supabaseService.getAdminClient();
            const { data, error } = await supabaseAdmin
                .from("profiles")
                .update(updates)
                .eq("id", id)
                .select()
                .maybeSingle();
            if (error) {
                this.logger.error(`Admin update error: ${error.message}`);
                throw new common_1.InternalServerErrorException(`Admin update failed: ${error.message}`);
            }
            if (!data) {
                throw new common_1.NotFoundException(`Profile with ID ${id} not found`);
            }
            return data;
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Error in adminUpdate: ${error.message}`);
            }
            else {
                this.logger.error(`Error in adminUpdate: ${String(error)}`);
            }
            throw error;
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], UsersService);
//# sourceMappingURL=users.service.js.map