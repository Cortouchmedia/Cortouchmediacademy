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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("./supabase.service");
let UsersService = class UsersService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async getProfile(userId) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (error)
            throw new common_1.UnauthorizedException('Profile not found');
        return data;
    }
    async updateProfile(userId, profileData) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('profiles')
            .update(profileData)
            .eq('id', userId)
            .select()
            .single();
        if (error)
            throw new common_1.UnauthorizedException('Failed to update profile');
        return data;
    }
    async getAllByRole(role) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', role);
        if (error)
            throw new common_1.UnauthorizedException(`Failed to fetch ${role}s`);
        return data;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], UsersService);
//# sourceMappingURL=users.service.js.map