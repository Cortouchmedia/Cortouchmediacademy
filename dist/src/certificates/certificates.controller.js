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
exports.CertificatesController = void 0;
const common_1 = require("@nestjs/common");
const certificates_service_1 = require("./certificates.service");
let CertificatesController = class CertificatesController {
    constructor(certificatesService) {
        this.certificatesService = certificatesService;
    }
    async getMyCertificates(userId) {
        return this.certificatesService.getUserCertificates(userId);
    }
    async getCertificateByCourse(userId, courseId) {
        return this.certificatesService.getCertificateByCourse(userId, courseId);
    }
    async verifyCertificate(code) {
        return this.certificatesService.verifyCertificate(code);
    }
    async generateCertificate(userId, courseId, grade) {
        return this.certificatesService.generateManualCertificate(userId, courseId, grade);
    }
    async getCertificateById(id) {
        return this.certificatesService.getCertificateById(id);
    }
    async getAllCertificates(limit = 50, offset = 0) {
        return this.certificatesService.getAllCertificates(limit, offset);
    }
    async getCertificateStats() {
        return this.certificatesService.getCertificateStats();
    }
};
exports.CertificatesController = CertificatesController;
__decorate([
    (0, common_1.Get)("my-certificates"),
    __param(0, (0, common_1.Query)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CertificatesController.prototype, "getMyCertificates", null);
__decorate([
    (0, common_1.Get)("user/:userId/course/:courseId"),
    __param(0, (0, common_1.Param)("userId")),
    __param(1, (0, common_1.Param)("courseId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CertificatesController.prototype, "getCertificateByCourse", null);
__decorate([
    (0, common_1.Get)("verify/:code"),
    __param(0, (0, common_1.Param)("code")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CertificatesController.prototype, "verifyCertificate", null);
__decorate([
    (0, common_1.Post)("generate"),
    __param(0, (0, common_1.Body)("userId")),
    __param(1, (0, common_1.Body)("courseId")),
    __param(2, (0, common_1.Body)("grade")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CertificatesController.prototype, "generateCertificate", null);
__decorate([
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CertificatesController.prototype, "getCertificateById", null);
__decorate([
    (0, common_1.Get)("admin/all"),
    __param(0, (0, common_1.Query)("limit")),
    __param(1, (0, common_1.Query)("offset")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CertificatesController.prototype, "getAllCertificates", null);
__decorate([
    (0, common_1.Get)("admin/stats"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CertificatesController.prototype, "getCertificateStats", null);
exports.CertificatesController = CertificatesController = __decorate([
    (0, common_1.Controller)("api/certificates"),
    __metadata("design:paramtypes", [certificates_service_1.CertificatesService])
], CertificatesController);
//# sourceMappingURL=certificates.controller.js.map