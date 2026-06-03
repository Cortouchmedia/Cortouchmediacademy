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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const supabase_service_1 = require("./supabase.service");
let UsersController = class UsersController {
    constructor(usersService, supabaseService) {
        this.usersService = usersService;
        this.supabaseService = supabaseService;
    }
    async getMyProfile(req) {
        const authHeader = req.headers.authorization;
        if (!authHeader)
            throw new common_1.UnauthorizedException('No token provided');
        const token = authHeader.split(' ')[1];
        const { data: { user }, error } = await this.supabaseService.getClient().auth.getUser(token);
        if (error || !user)
            throw new common_1.UnauthorizedException('Invalid token');
        return this.usersService.getProfile(user.id);
    }
    async updateMyProfile(req, body) {
        const authHeader = req.headers.authorization;
        if (!authHeader)
            throw new common_1.UnauthorizedException('No token provided');
        const token = authHeader.split(' ')[1];
        const { data: { user }, error } = await this.supabaseService.getClient().auth.getUser(token);
        if (error || !user)
            throw new common_1.UnauthorizedException('Invalid token');
        return this.usersService.updateProfile(user.id, body);
    }
    async getUsersByRole(role) {
        return this.usersService.getAllByRole(role);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMyProfile", null);
__decorate([
    (0, common_1.Post)('profile/update'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateMyProfile", null);
__decorate([
    (0, common_1.Get)('role/:role'),
    __param(0, (0, common_1.Param)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUsersByRole", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('api/auth/users'),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        supabase_service_1.SupabaseService])
], UsersController);
//# sourceMappingURL=users.controller.js.map